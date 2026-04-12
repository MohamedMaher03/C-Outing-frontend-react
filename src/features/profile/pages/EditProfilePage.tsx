import {
  ArrowLeft,
  Camera,
  User,
  Mail,
  Phone,
  Loader2,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useEditProfile } from "@/features/profile/hooks/useEditProfile";
import { buildDefaultAvatarDataUrl } from "@/features/profile/utils/defaultAvatar";
import { useI18n } from "@/components/i18n";

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
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
    reloadProfile,
  } = useEditProfile();

  const maxBirthDate = new Date().toISOString().slice(0, 10);

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
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => navigate("/profile")}
            aria-label={t("profile.edit.backToProfileAria")}
            className="h-11 w-11 rounded-full"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Button>
          <h1 className="text-role-subheading text-foreground">
            {t("profile.edit.title")}
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-24 pt-[clamp(1rem,2vw,1.5rem)] sm:pb-6 sm:pt-[clamp(1.25rem,2.5vw,2rem)] space-y-[clamp(1rem,2.2vw,1.8rem)]">
        {error && (
          <div
            className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 p-3"
            role="alert"
            aria-live="assertive"
          >
            <p className="text-sm text-destructive text-center break-words">
              {error}
            </p>
            <div className="mt-3 flex justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void reloadProfile()}
                disabled={loading || saving}
              >
                {t("common.retry")}
              </Button>
            </div>
          </div>
        )}

        <form
          id="edit-profile-form"
          onSubmit={handleSubmit}
          className="space-y-[clamp(1rem,2vw,1.75rem)]"
        >
          {/* Profile Photo */}
          <section className="flex flex-col items-center gap-4 rounded-2xl border border-border/70 bg-card/50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-secondary/10 flex items-center justify-center overflow-hidden">
                <img
                  src={
                    avatarPreview ||
                    buildDefaultAvatarDataUrl(
                      formData.name || t("profile.userFallback"),
                    )
                  }
                  alt={t("profile.edit.avatarAlt")}
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
                aria-label={t("profile.edit.changePhotoAria")}
                className="absolute bottom-0 right-0 h-11 w-11 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center hover:bg-secondary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-role-secondary text-muted-foreground">
              {avatarPreview
                ? t("profile.edit.photoHint.withPhoto")
                : t("profile.edit.photoHint.withoutPhoto")}
            </p>
          </section>

          {/* Form Fields */}
          <section className="grid gap-4 rounded-2xl border border-border/70 bg-card/40 p-4 sm:grid-cols-2 sm:p-5">
            <div className="space-y-2 sm:col-span-1">
              <Label
                htmlFor="name"
                className="text-role-secondary font-semibold text-foreground"
              >
                {t("profile.edit.name")}
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  maxLength={100}
                  autoComplete="name"
                  className="pl-10"
                  placeholder={t("profile.edit.namePlaceholder")}
                />
              </div>
            </div>

            <div className="space-y-2 sm:col-span-1">
              <Label
                htmlFor="phoneNumber"
                className="text-role-secondary font-semibold text-foreground"
              >
                {t("profile.edit.phone")}
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  maxLength={30}
                  inputMode="tel"
                  autoComplete="tel"
                  className="pl-10"
                  placeholder={t("profile.edit.phonePlaceholder")}
                />
              </div>
              <p className="text-role-caption text-muted-foreground">
                {t("profile.edit.phoneHint")}
              </p>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label
                htmlFor="email"
                className="text-role-secondary font-semibold text-foreground"
              >
                {t("profile.edit.email")}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  readOnly
                  autoComplete="email"
                  className="pl-10"
                  placeholder={t("profile.edit.email")}
                />
              </div>
              <p className="text-role-caption text-muted-foreground">
                {t("profile.edit.emailHint")}
              </p>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label
                htmlFor="bio"
                className="text-role-secondary font-semibold text-foreground"
              >
                {t("profile.edit.bio")}
              </Label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                maxLength={500}
                rows={4}
                dir="auto"
                className="flex min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder={t("profile.edit.bioPlaceholder")}
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-role-caption text-muted-foreground">
                  {t("profile.edit.bioHint", { max: 500 })}
                </p>
                <p className="text-role-caption text-muted-foreground text-numeric-tabular">
                  {t("profile.edit.bioCounter", {
                    count: formData.bio.length,
                    max: 500,
                  })}
                </p>
              </div>
            </div>

            <div className="space-y-2 sm:col-span-1">
              <Label
                htmlFor="birthDate"
                className="text-role-secondary font-semibold text-foreground"
              >
                {t("profile.edit.birthDate")}
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={handleChange}
                  max={maxBirthDate}
                  className="pl-10"
                  placeholder={t("profile.edit.birthDatePlaceholder")}
                />
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="hidden gap-3 pt-2 sm:flex">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate("/profile")}
              className="flex-1"
            >
              {t("profile.edit.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 bg-primary text-primary-foreground hover:bg-navy-light font-semibold"
            >
              {saving ? t("profile.edit.saving") : t("profile.edit.save")}
            </Button>
          </div>
        </form>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur-sm sm:hidden">
        <div className="mx-auto max-w-3xl px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate("/profile")}
              className="flex-1"
            >
              {t("profile.edit.cancel")}
            </Button>
            <Button
              type="submit"
              form="edit-profile-form"
              disabled={saving}
              className="flex-1 bg-primary text-primary-foreground hover:bg-navy-light font-semibold"
            >
              {saving ? t("profile.edit.saving") : t("profile.edit.save")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
