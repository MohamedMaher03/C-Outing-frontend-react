/**
 * Manage Places Page (Admin)
 *
 * Full CRUD on places: list, search, filter by status, change status, delete.
 * Enhanced: Add Place form with validated fields, dropdowns, photo preview & toast feedback.
 */

import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import {
  Search,
  MapPin,
  Star,
  CheckCircle,
  Trash2,
  Eye,
  XCircle,
  Plus,
  X,
  Upload,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useManagePlaces } from "@/features/admin/hooks/useManagePlaces";
import {
  AdminEmptyState,
  AdminErrorBanner,
  AdminFilterChips,
  AdminPageLayout,
  AdminPageHeader,
  AdminSection,
} from "@/features/admin/components";
import { PLACE_STATUS_FILTER_OPTIONS } from "@/features/admin/constants/filterOptions";
import { DISTRICTS } from "@/mocks/mockData";
import {
  COMMON_PLACE_TAGS,
  PRICE_LEVEL_OPTIONS,
} from "@/features/admin/constants/placeManagement";
import {
  adminToastClasses,
  placeStatusConfig,
} from "@/features/admin/constants/statusConfigs";
import { EMPTY_PLACE_FORM } from "@/features/admin/utils/placeForm";

const ADMIN_LIST_ROW_STYLE: CSSProperties = {
  contentVisibility: "auto",
  containIntrinsicSize: "110px",
  contain: "layout paint style",
};

// ── Constants ─────────────────────────────────────────────────

// ── Component ─────────────────────────────────────────────────

const ManagePlacesPage = () => {
  const navigate = useNavigate();
  const formRef = useRef<HTMLDivElement>(null);
  const tagPickerRef = useRef<HTMLDivElement>(null);

  const {
    places,
    categories,
    loading,
    error,
    pendingPlaceIds,
    search,
    statusFilter,
    filteredPlaces: filtered,
    showAddForm,
    form,
    formErrors,
    submittingForm,
    showTagPicker,
    toasts,
    setSearch,
    setStatusFilter,
    setShowAddForm,
    setForm,
    setShowTagPicker,
    retry,
    handleStatusChange,
    handleDelete,
    handleAddPlace,
    toggleTag,
  } = useManagePlaces();

  // Scroll to form when opened (DOM-specific side effect stays in the component)
  useEffect(() => {
    let timerId: number | null = null;

    if (showAddForm) {
      timerId = window.setTimeout(
        () =>
          formRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          }),
        50,
      );
    }

    return () => {
      if (timerId) {
        window.clearTimeout(timerId);
      }
    };
  }, [showAddForm]);

  useEffect(() => {
    if (!showTagPicker) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (!tagPickerRef.current) return;
      if (!tagPickerRef.current.contains(event.target as Node)) {
        setShowTagPicker(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowTagPicker(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [setShowTagPicker, showTagPicker]);

  const placeSummary = useMemo(
    () => ({
      flagged: places.filter((place) => place.status === "flagged").length,
    }),
    [places],
  );

  if (loading) {
    return <LoadingSpinner size="md" text="Loading places..." fullScreen />;
  }

  return (
    <AdminPageLayout>
      {/* Toast Notifications */}
      <div
        className="fixed top-4 left-4 right-4 z-50 flex flex-col gap-2 pointer-events-none sm:left-auto sm:right-4"
        role="status"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "max-w-xs rounded-xl px-4 py-3 text-role-secondary font-medium pointer-events-auto transition-all",
              adminToastClasses[t.variant],
            )}
          >
            {t.message}
          </div>
        ))}
      </div>

      <AdminErrorBanner
        title="Couldn't update places"
        message={error}
        onRetry={() => {
          void retry();
        }}
      />

      {/* Header */}
      <AdminPageHeader
        title="Manage Places"
        description={`${places.length} total places · ${placeSummary.flagged} flagged`}
        icon={MapPin}
        actions={
          <Button
            onClick={() => setShowAddForm((v) => !v)}
            className="gap-2 flex-shrink-0 w-full sm:w-auto"
            variant={showAddForm ? "outline" : "default"}
            aria-expanded={showAddForm}
            aria-controls="admin-add-place-form"
          >
            {showAddForm ? (
              <X className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {showAddForm ? "Cancel" : "Add Place"}
          </Button>
        }
      />

      {/* Add Place Form */}
      {showAddForm && (
        <AdminSection tone="surface" className="py-0" contentClassName="gap-5">
          <div id="admin-add-place-form" ref={formRef} className="space-y-5">
            <h2 className="flex items-center gap-2 text-role-body font-semibold text-foreground">
              <Plus className="h-4 w-4 text-secondary" />
              New Place
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="place-name">Place Name *</Label>
                <Input
                  id="place-name"
                  placeholder="e.g. Al-Azhar Park"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  className={cn(formErrors.name && "border-destructive")}
                />
                {formErrors.name && (
                  <p className="text-role-caption text-destructive">
                    {formErrors.name}
                  </p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <Label htmlFor="place-category">Category *</Label>
                <select
                  id="place-category"
                  value={form.category}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, category: e.target.value }))
                  }
                  className={cn(
                    "w-full min-h-11 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring",
                    formErrors.category && "border-destructive",
                  )}
                >
                  <option value="">Select category…</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.label}>
                      {c.label}
                    </option>
                  ))}
                </select>
                {formErrors.category && (
                  <p className="text-role-caption text-destructive">
                    {formErrors.category}
                  </p>
                )}
              </div>

              {/* District */}
              <div className="space-y-1.5">
                <Label htmlFor="place-district">District *</Label>
                <select
                  id="place-district"
                  value={form.district}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, district: e.target.value }))
                  }
                  className={cn(
                    "w-full min-h-11 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring",
                    formErrors.district && "border-destructive",
                  )}
                >
                  <option value="">Select district…</option>
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                {formErrors.district && (
                  <p className="text-role-caption text-destructive">
                    {formErrors.district}
                  </p>
                )}
              </div>

              {/* Price Level */}
              <div className="space-y-1.5">
                <Label>Price Level</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {PRICE_LEVEL_OPTIONS.map((lvl) => (
                    <button
                      key={lvl.value}
                      type="button"
                      onClick={() =>
                        setForm((p) => ({ ...p, priceLevel: lvl.value }))
                      }
                      className={cn(
                        "min-h-11 rounded-lg border px-3 py-2 text-left transition-all motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        form.priceLevel === lvl.value
                          ? "bg-secondary text-secondary-foreground border-secondary"
                          : "border-border text-muted-foreground hover:border-secondary/50",
                      )}
                    >
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold leading-tight text-foreground">
                          {lvl.label}
                        </p>
                        <p className="text-[10px] leading-tight text-muted-foreground">
                          {lvl.caption}
                          <span className="ml-1 font-semibold">
                            {lvl.symbol}
                          </span>
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="place-phone">Phone</Label>
                <Input
                  id="place-phone"
                  placeholder="+20 2 1234 5678"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, phone: e.target.value }))
                  }
                  className={cn(formErrors.phone && "border-destructive")}
                />
                {formErrors.phone && (
                  <p className="text-role-caption text-destructive">
                    {formErrors.phone}
                  </p>
                )}
              </div>

              {/* Website */}
              <div className="space-y-1.5">
                <Label htmlFor="place-website">Website</Label>
                <Input
                  id="place-website"
                  placeholder="https://example.com"
                  value={form.website}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, website: e.target.value }))
                  }
                  className={cn(formErrors.website && "border-destructive")}
                />
                {formErrors.website && (
                  <p className="text-role-caption text-destructive">
                    {formErrors.website}
                  </p>
                )}
              </div>
            </div>

            {/* About */}
            <div className="space-y-1.5">
              <Label htmlFor="place-desc">About *</Label>
              <textarea
                id="place-desc"
                rows={3}
                placeholder="Describe the place (at least 20 characters)…"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                className={cn(
                  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring",
                  formErrors.description && "border-destructive",
                )}
              />
              <div className="flex justify-between items-center">
                {formErrors.description ? (
                  <p className="text-role-caption text-destructive">
                    {formErrors.description}
                  </p>
                ) : (
                  <span />
                )}
                <span className="text-role-caption text-muted-foreground">
                  {form.description.length} chars
                </span>
              </div>
            </div>

            {/* Why Recommend */}
            <div className="space-y-1.5">
              <Label htmlFor="place-why">Why Recommend</Label>
              <textarea
                id="place-why"
                rows={2}
                placeholder="What makes this place special?"
                value={form.whyRecommend}
                onChange={(e) =>
                  setForm((p) => ({ ...p, whyRecommend: e.target.value }))
                }
                className={cn(
                  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring",
                  formErrors.whyRecommend && "border-destructive",
                )}
              />
              {formErrors.whyRecommend && (
                <p className="text-role-caption text-destructive">
                  {formErrors.whyRecommend}
                </p>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <Label>Tags</Label>
              <div className="relative" ref={tagPickerRef}>
                <button
                  type="button"
                  onClick={() => setShowTagPicker(!showTagPicker)}
                  className="flex w-full min-h-11 items-center justify-between rounded-md border border-input bg-background px-3 text-sm shadow-sm transition-colors motion-reduce:transition-none hover:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-haspopup="listbox"
                  aria-expanded={showTagPicker}
                  aria-controls="place-tag-picker-options"
                >
                  <span className="text-muted-foreground">
                    {form.tags.length === 0
                      ? "Select tags…"
                      : `${form.tags.length} tag(s) selected`}
                  </span>
                  {showTagPicker ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                {showTagPicker && (
                  <div
                    id="place-tag-picker-options"
                    role="listbox"
                    className="absolute z-20 top-full mt-1 left-0 right-0 bg-card border border-border rounded-xl p-3 shadow-lg flex flex-wrap gap-2"
                  >
                    {COMMON_PLACE_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        role="option"
                        aria-selected={form.tags.includes(tag)}
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-xs font-medium transition-all motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                          form.tags.includes(tag)
                            ? "bg-secondary text-secondary-foreground border-secondary"
                            : "border-border text-muted-foreground hover:border-secondary/50",
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {form.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-xs font-medium"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => toggleTag(tag)}
                        aria-label={`Remove tag ${tag}`}
                        className="rounded-sm text-secondary transition-colors motion-reduce:transition-none hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Image URL */}
            <div className="space-y-1.5">
              <Label htmlFor="place-image">Image URL *</Label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    id="place-image"
                    placeholder="https://images.example.com/place.jpg"
                    value={form.image}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, image: e.target.value }))
                    }
                    className={cn(formErrors.image && "border-destructive")}
                  />
                  {formErrors.image && (
                    <p className="mt-1 text-role-caption text-destructive">
                      {formErrors.image}
                    </p>
                  )}
                </div>
                {form.image && (
                  <div className="h-16 w-16 rounded-xl overflow-hidden border border-border flex-shrink-0">
                    <img
                      src={form.image}
                      alt="Place image preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "";
                      }}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                )}
                {!form.image && (
                  <div className="h-16 w-16 rounded-xl border-2 border-dashed border-border flex items-center justify-center flex-shrink-0">
                    <Upload className="h-5 w-5 text-muted-foreground/50" />
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-border bg-card/95 pt-3 pb-[max(0.25rem,env(safe-area-inset-bottom))] backdrop-blur supports-[backdrop-filter]:bg-card/80 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setForm(EMPTY_PLACE_FORM);
                  setShowTagPicker(false);
                }}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddPlace}
                disabled={submittingForm}
                className="gap-2 w-full sm:w-auto"
              >
                {submittingForm ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{" "}
                    Saving…
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" /> Add Place
                  </>
                )}
              </Button>
            </div>
          </div>
        </AdminSection>
      )}

      <AdminSection
        tone="muted"
        title="Place Filters"
        description="Search by name or district, then slice the queue by status"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search places or districts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="lg:w-auto">
            <AdminFilterChips
              label="Status"
              options={PLACE_STATUS_FILTER_OPTIONS}
              value={statusFilter}
              onChange={setStatusFilter}
            />
          </div>
        </div>
      </AdminSection>

      <AdminSection
        title="Place Records"
        description={`${filtered.length} places in current view`}
        contentClassName="gap-3"
      >
        {filtered.length === 0 ? (
          <AdminEmptyState
            icon={MapPin}
            title="No places found"
            description="No records match your search or status filter."
          />
        ) : (
          filtered.map((place) => {
            const config = placeStatusConfig[place.status];
            const StatusIcon = config.icon;
            const isPendingAction = pendingPlaceIds.includes(place.id);

            return (
              <div
                key={place.id}
                className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 transition-all motion-reduce:transition-none hover:border-secondary/30 hover:shadow-sm sm:flex-row sm:items-center"
                style={ADMIN_LIST_ROW_STYLE}
              >
                {/* Image */}
                <img
                  src={place.image}
                  alt={place.name}
                  className="h-14 w-14 rounded-xl object-cover flex-shrink-0"
                  loading="lazy"
                  decoding="async"
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {place.name}
                    </p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "px-1.5 py-0 text-role-caption",
                        config.class,
                      )}
                    >
                      <StatusIcon className="h-2.5 w-2.5 mr-0.5" />{" "}
                      {config.label}
                    </Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-role-caption text-muted-foreground">
                    <span>{place.category}</span>
                    <span>·</span>
                    <span>{place.district}</span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 text-secondary fill-secondary" />{" "}
                      {place.rating}
                    </span>
                    <span>·</span>
                    <span>{place.reviewCount} reviews</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap flex-shrink-0 w-full sm:w-auto justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/venue/${place.id}`)}
                    className="text-xs gap-1 min-h-11 sm:h-8"
                    disabled={isPendingAction}
                  >
                    <Eye className="h-3.5 w-3.5" /> View
                  </Button>

                  {place.status === "pending" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        void handleStatusChange(place.id, "active")
                      }
                      className="min-h-11 gap-1 text-role-secondary text-primary hover:text-primary sm:h-8"
                      disabled={isPendingAction}
                    >
                      {isPendingAction ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle className="h-3.5 w-3.5" />
                      )}{" "}
                      Approve
                    </Button>
                  )}

                  {place.status === "flagged" && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          void handleStatusChange(place.id, "active")
                        }
                        className="min-h-11 gap-1 text-role-secondary text-primary hover:text-primary sm:h-8"
                        disabled={isPendingAction}
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> Clear
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          void handleStatusChange(place.id, "removed")
                        }
                        className="min-h-11 gap-1 text-role-secondary text-destructive hover:text-destructive sm:h-8"
                        disabled={isPendingAction}
                      >
                        <XCircle className="h-3.5 w-3.5" /> Remove
                      </Button>
                    </>
                  )}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs gap-1 min-h-11 sm:h-8 text-destructive hover:text-destructive"
                        disabled={isPendingAction}
                        aria-label={`Delete ${place.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Place</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to permanently delete "
                          {place.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            void handleDelete(place.id, place.name)
                          }
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          disabled={isPendingAction}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            );
          })
        )}
      </AdminSection>
    </AdminPageLayout>
  );
};

export default ManagePlacesPage;
