/**
 * Moderate Places Page (Moderator)
 *
 * Verify/edit place information. Moderators can approve, flag, add,
 * and delete places directly.
 */

import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import {
  Search,
  MapPin,
  Star,
  CheckCircle,
  Eye,
  Flag,
  Plus,
  X,
  Upload,
  ChevronDown,
  ChevronUp,
  Trash2,
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
import { DISTRICTS } from "@/mocks/mockData";
import { useModeratePlaces } from "@/features/moderator/hooks/useModeratePlaces";
import type { PriceLevel } from "@/features/admin/types";
import {
  COMMON_PLACE_TAGS,
  PRICE_LEVEL_OPTIONS,
} from "@/features/admin/constants/placeManagement";
import {
  moderatorPlaceStatusConfig,
  moderatorPlaceRowStateClass,
  moderatorToastClasses,
} from "@/features/moderator/constants/statusConfigs";
import { MODERATOR_PLACE_STATUS_FILTER_OPTIONS } from "@/features/moderator/constants/filterOptions";
import {
  ModeratorEmptyState,
  ModeratorErrorBanner,
  ModeratorFilterChips,
  ModeratorPageHeader,
  ModeratorPageLayout,
  ModeratorSection,
} from "@/features/moderator/components";
import { formatCount, pluralize } from "@/features/moderator/utils/formatters";

const PLACE_PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' fill='%23f4efe5'/%3E%3Crect x='14' y='18' width='68' height='60' rx='10' fill='%23e5d8bf'/%3E%3Ccircle cx='38' cy='42' r='9' fill='%23967f59'/%3E%3Cpath d='M24 67c4-8 12-12 20-12s16 4 20 12' stroke='%23806a49' stroke-width='6' fill='none' stroke-linecap='round'/%3E%3C/svg%3E";

const EMPTY_FORM = {
  name: "",
  category: "",
  district: "",
  description: "",
  priceLevel: "mid_range" as PriceLevel,
  tags: [] as string[],
  image: "",
  phone: "",
  website: "",
};

const MODERATOR_PLACE_ROW_STYLE: CSSProperties = {
  contentVisibility: "auto",
  containIntrinsicSize: "116px",
  contain: "layout paint style",
};

const ModeratePlacesPage = () => {
  const navigate = useNavigate();
  const formRef = useRef<HTMLDivElement>(null);
  const tagPickerRef = useRef<HTMLDivElement>(null);

  const {
    places,
    categories,
    loading,
    error,
    pendingPlaceIdSet,
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
    handleApprove,
    handleFlag,
    handleDeletePlace,
    handleAddPlace,
    toggleTag,
  } = useModeratePlaces();

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
    () =>
      places.reduce(
        (summary, place) => {
          if (place.status === "pending") {
            summary.pending += 1;
          }
          if (place.status === "flagged") {
            summary.flagged += 1;
          }
          return summary;
        },
        { pending: 0, flagged: 0 },
      ),
    [places],
  );

  if (loading) {
    return <LoadingSpinner size="md" text="Loading places..." fullScreen />;
  }

  return (
    <ModeratorPageLayout>
      <div
        className="fixed top-4 left-4 right-4 z-50 flex flex-col gap-2 pointer-events-none sm:left-auto sm:right-4"
        role="status"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "max-w-xs rounded-xl px-4 py-3 text-role-secondary font-medium pointer-events-auto transition-all motion-reduce:transition-none",
              moderatorToastClasses[toast.variant],
            )}
          >
            {toast.message}
          </div>
        ))}
      </div>

      <ModeratorErrorBanner
        title="Couldn't update places"
        message={error}
        onRetry={() => {
          void retry();
        }}
      />

      <ModeratorPageHeader
        title="Moderate Places"
        description={`${formatCount(placeSummary.pending)} pending · ${formatCount(placeSummary.flagged)} flagged`}
        icon={MapPin}
        actions={
          <Button
            onClick={() => setShowAddForm((value) => !value)}
            className="gap-2 flex-shrink-0 w-full sm:w-auto"
            variant={showAddForm ? "outline" : "default"}
            aria-expanded={showAddForm}
            aria-controls="moderator-add-place-form"
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

      {showAddForm ? (
        <ModeratorSection
          tone="surface"
          className="py-0"
          contentClassName="gap-5"
        >
          <div
            id="moderator-add-place-form"
            ref={formRef}
            className="space-y-5"
          >
            <h2 className="text-role-body font-semibold text-foreground flex items-center gap-2">
              <Plus className="h-4 w-4 text-secondary" />
              Submit New Place
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="mod-place-name">Place Name *</Label>
                <Input
                  id="mod-place-name"
                  placeholder="e.g. Al-Azhar Park"
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  className={cn(formErrors.name && "border-destructive")}
                />
                {formErrors.name ? (
                  <p className="text-role-caption text-destructive">
                    {formErrors.name}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mod-place-category">Category *</Label>
                <select
                  id="mod-place-category"
                  value={form.category}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      category: event.target.value,
                    }))
                  }
                  className={cn(
                    "w-full min-h-11 rounded-md border border-input bg-background px-3 text-role-secondary shadow-sm focus:outline-none focus:ring-1 focus:ring-ring",
                    formErrors.category && "border-destructive",
                  )}
                >
                  <option value="">Select category...</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.label}>
                      {category.label}
                    </option>
                  ))}
                </select>
                {formErrors.category ? (
                  <p className="text-role-caption text-destructive">
                    {formErrors.category}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mod-place-district">District *</Label>
                <select
                  id="mod-place-district"
                  value={form.district}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      district: event.target.value,
                    }))
                  }
                  className={cn(
                    "w-full min-h-11 rounded-md border border-input bg-background px-3 text-role-secondary shadow-sm focus:outline-none focus:ring-1 focus:ring-ring",
                    formErrors.district && "border-destructive",
                  )}
                >
                  <option value="">Select district...</option>
                  {DISTRICTS.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
                {formErrors.district ? (
                  <p className="text-role-caption text-destructive">
                    {formErrors.district}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label>Price Level</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {PRICE_LEVEL_OPTIONS.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          priceLevel: level.value,
                        }))
                      }
                      className={cn(
                        "min-h-11 rounded-lg border px-3 py-2 text-left transition-all motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        form.priceLevel === level.value
                          ? "bg-secondary text-secondary-foreground border-secondary"
                          : "border-border text-muted-foreground hover:border-secondary/50",
                      )}
                    >
                      <div className="space-y-0.5">
                        <p className="text-role-caption font-semibold leading-tight text-foreground">
                          {level.label}
                        </p>
                        <p className="text-[10px] leading-tight text-muted-foreground">
                          {level.caption}
                          <span className="ml-1 font-semibold">
                            {level.symbol}
                          </span>
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mod-place-phone">Phone</Label>
                <Input
                  id="mod-place-phone"
                  placeholder="+20 2 1234 5678"
                  value={form.phone}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, phone: event.target.value }))
                  }
                  className={cn(formErrors.phone && "border-destructive")}
                />
                {formErrors.phone ? (
                  <p className="text-role-caption text-destructive">
                    {formErrors.phone}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mod-place-website">Website</Label>
                <Input
                  id="mod-place-website"
                  placeholder="https://example.com"
                  value={form.website}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      website: event.target.value,
                    }))
                  }
                  className={cn(formErrors.website && "border-destructive")}
                />
                {formErrors.website ? (
                  <p className="text-role-caption text-destructive">
                    {formErrors.website}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mod-place-desc">About *</Label>
              <textarea
                id="mod-place-desc"
                rows={3}
                placeholder="Describe the place (at least 20 characters)..."
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                className={cn(
                  "w-full rounded-md border border-input bg-background px-3 py-2 text-role-secondary shadow-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring",
                  formErrors.description && "border-destructive",
                )}
              />
              <div className="flex justify-between items-center gap-2">
                {formErrors.description ? (
                  <p className="text-role-caption text-destructive">
                    {formErrors.description}
                  </p>
                ) : (
                  <span />
                )}
                <span className="text-role-caption text-muted-foreground shrink-0">
                  {formatCount(form.description.length)} chars
                </span>
              </div>
            </div>

            <div className="space-y-1.5" ref={tagPickerRef}>
              <Label>Tags</Label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowTagPicker(!showTagPicker)}
                  className="flex items-center justify-between w-full min-h-11 rounded-md border border-input bg-background px-3 text-role-secondary shadow-sm hover:border-ring transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-haspopup="listbox"
                  aria-expanded={showTagPicker}
                  aria-controls="moderator-tag-picker-options"
                >
                  <span className="text-muted-foreground">
                    {form.tags.length === 0
                      ? "Select tags..."
                      : `${formatCount(form.tags.length)} ${pluralize(form.tags.length, "tag")} selected`}
                  </span>
                  {showTagPicker ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>

                {showTagPicker ? (
                  <div
                    id="moderator-tag-picker-options"
                    role="listbox"
                    className="absolute z-20 top-full mt-1 left-0 right-0 bg-card border border-border rounded-xl p-3 shadow-lg flex flex-wrap gap-2"
                  >
                    {COMMON_PLACE_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        role="option"
                        aria-selected={form.tags.includes(tag)}
                        onClick={() => toggleTag(tag)}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-role-caption font-medium border transition-all motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                          form.tags.includes(tag)
                            ? "bg-secondary text-secondary-foreground border-secondary"
                            : "border-border text-muted-foreground hover:border-secondary/50",
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              {form.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {form.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-role-caption font-medium"
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
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mod-place-image">Image URL *</Label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    id="mod-place-image"
                    placeholder="https://images.example.com/place.jpg"
                    value={form.image}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        image: event.target.value,
                      }))
                    }
                    className={cn(formErrors.image && "border-destructive")}
                  />
                  {formErrors.image ? (
                    <p className="text-role-caption text-destructive mt-1">
                      {formErrors.image}
                    </p>
                  ) : null}
                </div>

                {form.image ? (
                  <div className="h-16 w-16 rounded-xl overflow-hidden border border-border flex-shrink-0">
                    <img
                      src={form.image}
                      alt="Preview of selected place image"
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                      onError={(event) => {
                        (event.currentTarget as HTMLImageElement).src =
                          PLACE_PLACEHOLDER_IMAGE;
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-16 w-16 rounded-xl border-2 border-dashed border-border flex items-center justify-center flex-shrink-0">
                    <Upload className="h-5 w-5 text-muted-foreground/50" />
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 z-10 -mx-4 mt-2 flex flex-col-reverse gap-3 border-t border-border/70 bg-card/95 px-4 pt-3 pb-[max(0.35rem,env(safe-area-inset-bottom))] backdrop-blur supports-[backdrop-filter]:bg-card/85 sm:static sm:mx-0 sm:flex-row sm:justify-end sm:border-0 sm:bg-transparent sm:px-0 sm:pt-2 sm:pb-0 sm:backdrop-blur-0">
              <Button
                variant="outline"
                className="min-h-11"
                onClick={() => {
                  setShowAddForm(false);
                  setShowTagPicker(false);
                  setForm(EMPTY_FORM);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddPlace}
                disabled={submittingForm}
                className="gap-2 min-h-11"
              >
                {submittingForm ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" /> Submit Place
                  </>
                )}
              </Button>
            </div>
          </div>
        </ModeratorSection>
      ) : null}

      <ModeratorSection
        tone="muted"
        title="Moderation Filters"
        description="Find places quickly across mobile and desktop with search and status segments."
      >
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search places, categories, or districts..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-10"
            />
          </div>
          <div className="lg:min-w-[16rem]">
            <ModeratorFilterChips
              label="Status"
              options={MODERATOR_PLACE_STATUS_FILTER_OPTIONS}
              value={statusFilter}
              onChange={setStatusFilter}
            />
          </div>
        </div>
      </ModeratorSection>

      <ModeratorSection
        title="Places Queue"
        description={`${formatCount(filtered.length)} places in current view`}
        contentClassName="gap-4"
      >
        {filtered.length === 0 ? (
          <ModeratorEmptyState
            icon={MapPin}
            title="No places in this segment"
            description={
              search.trim().length > 0
                ? "No places match your search and selected status chips."
                : "No places match the current moderation filter."
            }
          />
        ) : (
          filtered.map((place) => {
            const config = moderatorPlaceStatusConfig[place.status];
            const StatusIcon = config.icon;
            const isPending = pendingPlaceIdSet.has(place.id);

            return (
              <div
                key={place.id}
                className={cn(
                  "space-y-4 rounded-xl border bg-card p-4 transition-all motion-reduce:transition-none hover:shadow-sm",
                  moderatorPlaceRowStateClass[place.status],
                )}
                aria-busy={isPending}
                style={MODERATOR_PLACE_ROW_STYLE}
              >
                <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
                  <img
                    src={place.image}
                    alt={place.name}
                    className="h-14 w-14 rounded-xl object-cover flex-shrink-0"
                    loading="lazy"
                    decoding="async"
                    onError={(event) => {
                      (event.currentTarget as HTMLImageElement).src =
                        PLACE_PLACEHOLDER_IMAGE;
                    }}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-role-secondary font-semibold text-foreground break-words">
                        {place.name}
                      </p>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-role-caption px-1.5 py-0",
                          config.class,
                        )}
                      >
                        <StatusIcon className="h-2.5 w-2.5 mr-0.5" />{" "}
                        {config.label}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-role-caption text-muted-foreground flex-wrap">
                      <span className="break-words">{place.category}</span>
                      <span>·</span>
                      <span className="break-words">{place.district}</span>

                      {place.rating > 0 ? (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-0.5">
                            <Star className="h-3 w-3 text-secondary fill-secondary" />
                            {place.rating}
                          </span>
                        </>
                      ) : null}

                      <span>·</span>
                      <span>
                        {formatCount(place.reviewCount)}{" "}
                        {pluralize(place.reviewCount, "review")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex w-full flex-wrap items-center gap-2 border-t border-border/60 pt-3 sm:justify-end sm:flex-nowrap">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/venue/${place.id}`)}
                    className="text-role-secondary gap-1 min-h-11 sm:h-8"
                  >
                    <Eye className="h-3.5 w-3.5" /> View
                  </Button>

                  {place.status === "pending" || place.status === "flagged" ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleApprove(place.id)}
                      disabled={isPending}
                      className="text-role-secondary gap-1 min-h-11 sm:h-8 text-primary hover:text-primary hover:bg-primary/10"
                    >
                      {isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle className="h-3.5 w-3.5" />
                      )}
                      Approve
                    </Button>
                  ) : null}

                  {place.status === "active" ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFlag(place.id)}
                      disabled={isPending}
                      className="text-role-secondary gap-1 min-h-11 sm:h-8 text-foreground hover:text-foreground hover:bg-secondary/20"
                    >
                      {isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Flag className="h-3.5 w-3.5" />
                      )}
                      Flag
                    </Button>
                  ) : null}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isPending}
                        className="text-role-secondary gap-1 min-h-11 sm:h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        aria-label={`Delete ${place.name}`}
                        title={`Delete ${place.name}`}
                      >
                        {isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete place</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{place.name}". This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            handleDeletePlace(place.id, place.name)
                          }
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
      </ModeratorSection>

      <ModeratorSection tone="muted" contentClassName="gap-0">
        <p className="text-role-secondary text-foreground break-words">
          <span className="font-medium">Note:</span> As a moderator, you can
          approve, flag, delete, or submit new places. Flagged places are sent
          to admin for follow-up.
        </p>
      </ModeratorSection>
    </ModeratorPageLayout>
  );
};

export default ModeratePlacesPage;
