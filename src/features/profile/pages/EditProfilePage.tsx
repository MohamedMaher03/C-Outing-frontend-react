import {
  ArrowLeft,
  Camera,
  User,
  Mail,
  Phone,
  Loader2,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useEditProfile } from "@/features/profile/hooks/useEditProfile";
import { buildDefaultAvatarDataUrl } from "@/features/profile/utils/defaultAvatar";

const EditProfilePage = () => {
  const {
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
  } = useEditProfile();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => history.back()}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Edit Profile</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Photo */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-secondary/10 flex items-center justify-center overflow-hidden">
                <img
                  src={
                    avatarPreview ||
                    buildDefaultAvatarDataUrl(formData.name || "User")
                  }
                  alt="Profile avatar"
                  className="h-full w-full object-cover"
                />
              </div>
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <button
                type="button"
                onClick={triggerFilePicker}
                disabled={saving}
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-secondary text-white flex items-center justify-center hover:bg-secondary/90 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              {avatarPreview
                ? "Click the camera to change photo"
                : "Click to upload a new photo"}
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-foreground"
              >
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10"
                  placeholder="Enter your name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  readOnly
                  className="pl-10"
                  placeholder="Email"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Email is managed by your account settings.
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="phoneNumber"
                className="text-sm font-medium text-foreground"
              >
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="pl-10"
                  placeholder="e.g. +20 123 456 7890"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Use international format with country code.
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="birthDate"
                className="text-sm font-medium text-foreground"
              >
                Birth Date
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={handleChange}
                  className="pl-10"
                  placeholder="Select your birth date"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => history.back()}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 bg-primary text-primary-foreground hover:bg-navy-light font-semibold"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;
