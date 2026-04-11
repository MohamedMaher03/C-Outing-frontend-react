/**
 * useEditProfile Hook
 *
 * Manages state and async actions for the Edit Profile page.
 * All data flows through profileService → (mock | API) according to
 * which path is active in the service layer.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getEditProfile,
  updateEditProfile,
} from "@/features/profile/services/profileService";
import type { EditProfileData } from "@/features/profile/types";
import { getErrorMessage } from "@/utils/apiError";
import { useI18n } from "@/components/i18n";

/** Max file size: 5 MB */
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_BIO_LENGTH = 500;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const PHONE_REGEX = /^\+[0-9]{1,3}[0-9\s\-()]{8,}$/;

interface UseEditProfileReturn {
  /** Current form values */
  formData: EditProfileData;
  /** Local preview URL for the selected avatar (before upload) */
  avatarPreview: string | null;
  /** True while the initial data is being fetched */
  loading: boolean;
  /** True while a save request is in-flight */
  saving: boolean;
  /** Error message, if any */
  error: string | null;
  /** Ref for the hidden file input */
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  /** Opens the native file picker */
  triggerFilePicker: () => void;
  /** Handles file selection from the hidden input */
  handleAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Update a single field in the form */
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  /** Submit the form — saves to service then navigates back */
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  /** Re-fetch profile settings after a load failure */
  reloadProfile: () => Promise<void>;
}

export const useEditProfile = (): UseEditProfileReturn => {
  const { t } = useI18n();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<EditProfileData>({
    name: "",
    email: "",
    bio: "",
    phoneNumber: "",
    birthDate: "",
    avatarUrl: undefined,
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pendingAvatarFile = useRef<File | null>(null);
  const submitInFlightRef = useRef(false);
  const latestLoadRunRef = useRef(0);

  const revokeIfBlobUrl = (url: string | null) => {
    if (url && url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  };

  const reloadProfile = useCallback(async () => {
    const runId = ++latestLoadRunRef.current;

    try {
      setLoading(true);
      setError(null);
      const data = await getEditProfile();

      if (runId !== latestLoadRunRef.current) {
        return;
      }

      setFormData(data);
      setAvatarPreview((previous) => {
        revokeIfBlobUrl(previous);
        return data.avatarUrl ?? null;
      });
      pendingAvatarFile.current = null;
    } catch (err) {
      if (runId !== latestLoadRunRef.current) {
        return;
      }

      setError(getErrorMessage(err, t("profile.edit.error.load")));
    } finally {
      if (runId === latestLoadRunRef.current) {
        setLoading(false);
      }
    }
  }, [t]);

  // Load current profile data on mount
  useEffect(() => {
    void reloadProfile();
  }, [reloadProfile]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(t("profile.edit.error.fileType"));
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError(t("profile.edit.error.fileSize"));
      return;
    }

    setError(null);

    // Create instant local preview
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview((previous) => {
      revokeIfBlobUrl(previous);
      return previewUrl;
    });

    // Store the file so it gets uploaded on form submit
    pendingAvatarFile.current = file;

    // Reset the input so selecting the same file again still triggers onChange
    e.target.value = "";
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (submitInFlightRef.current || saving) {
      return;
    }

    submitInFlightRef.current = true;

    try {
      setSaving(true);
      setError(null);

      const trimmedName = formData.name.trim();
      const trimmedBio = formData.bio.trim();
      const trimmedPhone = formData.phoneNumber.trim();

      if (trimmedName.length < 2 || trimmedName.length > 100) {
        setError(t("profile.edit.error.nameLength"));
        return;
      }

      if (trimmedPhone && !PHONE_REGEX.test(trimmedPhone)) {
        setError(t("profile.edit.error.phoneFormat"));
        return;
      }

      if (trimmedBio.length > MAX_BIO_LENGTH) {
        setError(t("profile.edit.error.bioMaxLength", { max: MAX_BIO_LENGTH }));
        return;
      }

      if (!formData.birthDate) {
        setError(t("profile.edit.error.birthDateRequired"));
        return;
      }

      const parsedBirthDate = new Date(formData.birthDate);
      if (Number.isNaN(parsedBirthDate.getTime())) {
        setError(t("profile.edit.error.birthDateInvalid"));
        return;
      }

      if (parsedBirthDate > new Date()) {
        setError(t("profile.edit.error.birthDateFuture"));
        return;
      }

      await updateEditProfile(
        {
          ...formData,
          name: trimmedName,
          bio: trimmedBio,
          phoneNumber: trimmedPhone,
        },
        pendingAvatarFile.current ?? undefined,
      );
      pendingAvatarFile.current = null;
      navigate("/profile");
    } catch (err) {
      setError(getErrorMessage(err, t("profile.edit.error.save")));
    } finally {
      submitInFlightRef.current = false;
      setSaving(false);
    }
  };

  return {
    formData,
    avatarPreview,
    loading,
    saving,
    error,
    fileInputRef,
    triggerFilePicker,
    handleAvatarChange,
    handleChange,
    handleSubmit,
    reloadProfile,
  };
};
