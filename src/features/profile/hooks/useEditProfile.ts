/**
 * useEditProfile Hook
 *
 * Manages state and async actions for the Edit Profile page.
 * All data flows through profileService → (mock | API) according to
 * which path is active in the service layer.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getEditProfile,
  updateEditProfile,
} from "@/features/profile/services/profileService";
import type { EditProfileData } from "@/features/profile/types";

interface UseEditProfileReturn {
  /** Current form values */
  formData: EditProfileData;
  /** True while the initial data is being fetched */
  loading: boolean;
  /** True while a save request is in-flight */
  saving: boolean;
  /** Error message, if any */
  error: string | null;
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
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load current profile data on mount
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getEditProfile();
        setFormData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
      await updateEditProfile(formData);
      navigate("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return {
    formData,
    loading,
    saving,
    error,
    handleChange,
    handleSubmit,
  };
};
