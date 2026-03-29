/**
 * Manage Places Page (Admin)
 *
 * Full CRUD on places: list, search, filter by status, change status, delete.
 * Enhanced: Add Place form with validated fields, dropdowns, photo preview & toast feedback.
 */

import { useEffect, useRef } from "react";
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
import { DISTRICTS } from "@/mocks/mockData";
import {
  COMMON_PLACE_TAGS,
  PRICE_LEVEL_OPTIONS,
} from "@/features/admin/constants/placeManagement";
import { placeStatusConfig } from "@/features/admin/constants/statusConfigs";
import { EMPTY_PLACE_FORM } from "@/features/admin/utils/placeForm";

// ── Constants ─────────────────────────────────────────────────

// ── Component ─────────────────────────────────────────────────

const ManagePlacesPage = () => {
  const navigate = useNavigate();
  const formRef = useRef<HTMLDivElement>(null);

  const {
    places,
    categories,
    loading,
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
    handleStatusChange,
    handleDelete,
    handleAddPlace,
    toggleTag,
  } = useManagePlaces();

  // Scroll to form when opened (DOM-specific side effect stays in the component)
  useEffect(() => {
    if (showAddForm) {
      setTimeout(
        () =>
          formRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          }),
        50,
      );
    }
  }, [showAddForm]);

  if (loading) {
    return <LoadingSpinner size="md" text="Loading places..." fullScreen />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white max-w-xs pointer-events-auto transition-all",
              t.variant === "success" && "bg-emerald-600",
              t.variant === "error" && "bg-red-600",
              t.variant === "info" && "bg-blue-600",
            )}
          >
            {t.message}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MapPin className="h-6 w-6 text-secondary" />
            Manage Places
          </h1>
          <p className="text-sm text-muted-foreground">
            {places.length} total places ·{" "}
            {places.filter((p) => p.status === "flagged").length} flagged
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm((v) => !v)}
          className="gap-2 flex-shrink-0"
          variant={showAddForm ? "outline" : "default"}
        >
          {showAddForm ? (
            <X className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {showAddForm ? "Cancel" : "Add Place"}
        </Button>
      </div>

      {/* Add Place Form */}
      {showAddForm && (
        <div
          ref={formRef}
          className="rounded-2xl border border-border bg-card p-6 space-y-5 shadow-sm"
        >
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Plus className="h-4 w-4 text-secondary" />
            New Place
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                className={cn(formErrors.name && "border-red-400")}
              />
              {formErrors.name && (
                <p className="text-xs text-red-500">{formErrors.name}</p>
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
                  "w-full h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring",
                  formErrors.category && "border-red-400",
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
                <p className="text-xs text-red-500">{formErrors.category}</p>
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
                  "w-full h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring",
                  formErrors.district && "border-red-400",
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
                <p className="text-xs text-red-500">{formErrors.district}</p>
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
                      "min-h-11 rounded-lg border px-3 py-2 text-left transition-all",
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
                        <span className="ml-1 font-semibold">{lvl.symbol}</span>
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
              />
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
              />
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
                formErrors.description && "border-red-400",
              )}
            />
            <div className="flex justify-between items-center">
              {formErrors.description ? (
                <p className="text-xs text-red-500">{formErrors.description}</p>
              ) : (
                <span />
              )}
              <span className="text-xs text-muted-foreground">
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
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label>Tags</Label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTagPicker(!showTagPicker)}
                className="flex items-center justify-between w-full h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm hover:border-ring transition-colors"
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
                <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-card border border-border rounded-xl p-3 shadow-lg flex flex-wrap gap-2">
                  {COMMON_PLACE_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
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
                    <button onClick={() => toggleTag(tag)}>
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
                  className={cn(formErrors.image && "border-red-400")}
                />
                {formErrors.image && (
                  <p className="text-xs text-red-500 mt-1">
                    {formErrors.image}
                  </p>
                )}
              </div>
              {form.image && (
                <div className="h-16 w-16 rounded-xl overflow-hidden border border-border flex-shrink-0">
                  <img
                    src={form.image}
                    alt="preview"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "";
                    }}
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
          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddForm(false);
                setForm(EMPTY_PLACE_FORM);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddPlace}
              disabled={submittingForm}
              className="gap-2"
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
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search places or districts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "active", "pending", "flagged", "removed"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                statusFilter === status
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40",
              )}
            >
              {status === "all"
                ? "All"
                : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Places List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-muted-foreground">No places found</p>
          </div>
        ) : (
          filtered.map((place) => {
            const config = placeStatusConfig[place.status];
            const StatusIcon = config.icon;

            return (
              <div
                key={place.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-secondary/30 hover:shadow-sm transition-all"
              >
                {/* Image */}
                <img
                  src={place.image}
                  alt={place.name}
                  className="h-14 w-14 rounded-xl object-cover flex-shrink-0"
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {place.name}
                    </p>
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] px-1.5 py-0", config.class)}
                    >
                      <StatusIcon className="h-2.5 w-2.5 mr-0.5" />{" "}
                      {config.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
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
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/venue/${place.id}`)}
                    className="text-xs gap-1 h-8"
                  >
                    <Eye className="h-3.5 w-3.5" /> View
                  </Button>

                  {place.status === "pending" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStatusChange(place.id, "active")}
                      className="text-xs gap-1 h-8 text-emerald-600 hover:text-emerald-700"
                    >
                      <CheckCircle className="h-3.5 w-3.5" /> Approve
                    </Button>
                  )}

                  {place.status === "flagged" && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStatusChange(place.id, "active")}
                        className="text-xs gap-1 h-8 text-emerald-600 hover:text-emerald-700"
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> Clear
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStatusChange(place.id, "removed")}
                        className="text-xs gap-1 h-8 text-red-600 hover:text-red-700"
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
                        className="text-xs gap-1 h-8 text-destructive hover:text-destructive"
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
                          onClick={() => handleDelete(place.id, place.name)}
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
      </div>
    </div>
  );
};

export default ManagePlacesPage;
