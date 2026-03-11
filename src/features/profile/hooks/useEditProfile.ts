/**
 * useEditProfile Hook
 *
 * Manages state and async actions for the Edit Profile page.
 * All data flows through profileService → (mock | API) according to
 * which path is active in the service layer.
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getEditProfile,
  updateEditProfile,
  uploadAvatar,
} from "@/features/profile/services/profileService";
import type { EditProfileData } from "@/features/profile/types";
import { getErrorMessage } from "@/utils/apiError";

/** Max file size: 5 MB */
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface UseEditProfileReturn {
  /** Current form values */
  formData: EditProfileData;
  /** Local preview URL for the selected avatar (before upload) */
  avatarPreview: string | null;
  /** True while the initial data is being fetched */
  loading: boolean;
  /** True while a save request is in-flight */
  saving: boolean;
  /** True while avatar is being uploaded */
  uploadingAvatar: boolean;
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
}

export const useEditProfile = (): UseEditProfileReturn => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<EditProfileData>({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    avatar: undefined,
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pendingAvatarFile = useRef<File | null>(null);

  // Load current profile data on mount
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getEditProfile();
        setFormData(data);
        if (data.avatar) {
          setAvatarPreview(data.avatar);
        }
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load profile"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
      setError("Please select a JPEG, PNG, or WebP image.");
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError("Image must be smaller than 5 MB.");
      return;
    }

    setError(null);

    // Create instant local preview
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

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
    try {
      setSaving(true);
      setError(null);

      let updatedAvatar = formData.avatar;

      // Upload avatar first if a new file was selected
      if (pendingAvatarFile.current) {
        setUploadingAvatar(true);
        const { avatarUrl } = await uploadAvatar(pendingAvatarFile.current);
        updatedAvatar = avatarUrl;
        pendingAvatarFile.current = null;
        setUploadingAvatar(false);
      }

      await updateEditProfile({ ...formData, avatar: updatedAvatar });
      navigate("/profile");
    } catch (err) {
      setUploadingAvatar(false);
      setError(getErrorMessage(err, "Failed to save profile"));
    } finally {
      setSaving(false);
    }
  };

  return {
    formData,
    avatarPreview,
    loading,
    saving,
    uploadingAvatar,
    error,
    fileInputRef,
    triggerFilePicker,
    handleAvatarChange,
    handleChange,
    handleSubmit,
  };
};
