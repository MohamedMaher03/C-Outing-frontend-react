/**
 * Moderate Places Page (Moderator)
 *
 * Verify/edit place information. Moderators can approve/flag/add places.
 * Delete is via escalation to admin (with confirmation dialog + toast).
 */

import { useState, useEffect, useRef } from "react";
import {
  Search,
  MapPin,
  Star,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Eye,
  Flag,
  Plus,
  X,
  Upload,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Trash2,
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
import { adminMock } from "@/features/admin/mocks/adminMock";
import type { AdminPlace, AdminCategory } from "@/features/admin/types";
import { DISTRICTS } from "@/mocks/mockData";

// ── Constants ─────────────────────────────────────────────────

const COMMON_TAGS = [
  "Outdoor",
  "Romantic",
  "Scenic",
  "Street Food",
  "Casual",
  "Local",
  "Art",
  "Culture",
  "Free Entry",
  "Co-working",
  "Tech",
  "Historical",
  "Shopping",
  "Iconic",
  "Nightlife",
  "Live Music",
  "Parks",
  "Family-friendly",
  "Rooftop",
  "Fine Dining",
  "Nile View",
  "Late Night",
  "Hidden Gem",
  "Budget Friendly",
  "Pet Friendly",
  "Instagrammable",
];

// ── Types ─────────────────────────────────────────────────────

interface PlaceFormData {
  name: string;
  category: string;
  district: string;
  description: string;
  priceLevel: 1 | 2 | 3;
  tags: string[];
  image: string;
  phone: string;
  website: string;
}

interface FormErrors {
  name?: string;
  category?: string;
  district?: string;
  description?: string;
  image?: string;
}

interface Toast {
  id: string;
  message: string;
  variant: "success" | "error" | "info" | "warning";
}

// ── Config ────────────────────────────────────────────────────

const statusConfig: Record<
  string,
  { label: string; class: string; icon: typeof CheckCircle }
> = {
  active: {
    label: "Active",
    class: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: CheckCircle,
  },
  pending: {
    label: "Pending",
    class: "bg-amber-100 text-amber-700 border-amber-200",
    icon: Clock,
  },
  flagged: {
    label: "Flagged",
    class: "bg-red-100 text-red-700 border-red-200",
    icon: AlertTriangle,
  },
  removed: {
    label: "Removed",
    class: "bg-gray-100 text-gray-500 border-gray-200",
    icon: XCircle,
  },
};

const EMPTY_FORM: PlaceFormData = {
  name: "",
  category: "",
  district: "",
  description: "",
  priceLevel: 2,
  tags: [],
  image: "",
  phone: "",
  website: "",
};

// ── Component ─────────────────────────────────────────────────

const ModeratePlacesPage = () => {
  const navigate = useNavigate();
  const formRef = useRef<HTMLDivElement>(null);

  // List state
  const [places, setPlaces] = useState<AdminPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Form state
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<PlaceFormData>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submittingForm, setSubmittingForm] = useState(false);
  const [showTagPicker, setShowTagPicker] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (
    message: string,
    variant: Toast["variant"] = "success",
  ) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3500,
    );
  };

  // Load data
  useEffect(() => {
    const load = async () => {
      try {
        const [placesData, catsData] = await Promise.all([
          adminMock.getPlaces(),
          adminMock.getCategories(),
        ]);
        setPlaces(placesData);
        setCategories(catsData);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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

  // Handlers
  const handleApprove = async (placeId: string) => {
    await adminMock.updatePlaceStatus(placeId, "active");
    setPlaces((prev) =>
      prev.map((p) =>
        p.id === placeId ? { ...p, status: "active" as const } : p,
      ),
    );
    showToast("Place approved successfully.");
  };

  const handleFlag = async (placeId: string) => {
    await adminMock.updatePlaceStatus(placeId, "flagged");
    setPlaces((prev) =>
      prev.map((p) =>
        p.id === placeId ? { ...p, status: "flagged" as const } : p,
      ),
    );
    showToast("Place flagged for review.", "warning");
  };

  const handleEscalateDelete = async (placeId: string, placeName: string) => {
    await adminMock.deletePlace(placeId);
    setPlaces((prev) => prev.filter((p) => p.id !== placeId));
    showToast(
      `"${placeName}" escalated for deletion — pending admin review.`,
      "warning",
    );
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    if (!form.name.trim()) errors.name = "Place name is required.";
    if (!form.category) errors.category = "Please select a category.";
    if (!form.district) errors.district = "Please select a district.";
    if (!form.description.trim()) {
      errors.description = "Description is required.";
    } else if (form.description.trim().length < 20) {
      errors.description = "Description must be at least 20 characters.";
    }
    if (!form.image.trim()) errors.image = "Image URL is required.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddPlace = async () => {
    if (!validateForm()) return;
    setSubmittingForm(true);
    try {
      const newPlace = await adminMock.addPlace({
        name: form.name.trim(),
        category: form.category,
        district: form.district,
        image: form.image.trim(),
        tags: form.tags,
        description: form.description.trim(),
        priceLevel: form.priceLevel,
        phone: form.phone.trim(),
        website: form.website.trim(),
      });
      setPlaces((prev) => [newPlace, ...prev]);
      setForm(EMPTY_FORM);
      setFormErrors({});
      setShowAddForm(false);
      showToast(`"${newPlace.name}" submitted for admin review.`);
    } catch {
      showToast("Failed to submit place. Please try again.", "error");
    } finally {
      setSubmittingForm(false);
    }
  };

  const toggleTag = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const filtered = places.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.district.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <LoadingSpinner size="md" text="Loading places..." fullScreen />;
  }

  const pendingCount = places.filter((p) => p.status === "pending").length;
  const flaggedCount = places.filter((p) => p.status === "flagged").length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white max-w-xs pointer-events-auto transition-all",
              t.variant === "success" && "bg-emerald-600",
              t.variant === "error" && "bg-red-600",
              t.variant === "warning" && "bg-amber-500",
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
            Moderate Places
          </h1>
          <p className="text-sm text-muted-foreground">
            {pendingCount} pending · {flaggedCount} flagged
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
            Submit New Place
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="mod-place-name">Place Name *</Label>
              <Input
                id="mod-place-name"
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
              <Label htmlFor="mod-place-category">Category *</Label>
              <select
                id="mod-place-category"
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
              <Label htmlFor="mod-place-district">District *</Label>
              <select
                id="mod-place-district"
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
              <div className="flex gap-2">
                {([1, 2, 3] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, priceLevel: lvl }))}
                    className={cn(
                      "flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all",
                      form.priceLevel === lvl
                        ? "bg-secondary text-secondary-foreground border-secondary"
                        : "border-border text-muted-foreground hover:border-secondary/50",
                    )}
                  >
                    {Array.from({ length: lvl }).map((_, i) => (
                      <DollarSign key={i} className="h-3.5 w-3.5" />
                    ))}
                  </button>
                ))}
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="mod-place-phone">Phone</Label>
              <Input
                id="mod-place-phone"
                placeholder="+20 2 1234 5678"
                value={form.phone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, phone: e.target.value }))
                }
              />
            </div>

            {/* Website */}
            <div className="space-y-1.5">
              <Label htmlFor="mod-place-website">Website</Label>
              <Input
                id="mod-place-website"
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
            <Label htmlFor="mod-place-desc">About *</Label>
            <textarea
              id="mod-place-desc"
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

          {/* Tags */}
          <div className="space-y-1.5">
            <Label>Tags</Label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTagPicker((v) => !v)}
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
                  {COMMON_TAGS.map((tag) => (
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
            <Label htmlFor="mod-place-image">Image URL *</Label>
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  id="mod-place-image"
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
              {form.image ? (
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
              ) : (
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
                setForm(EMPTY_FORM);
                setFormErrors({});
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
                  Submitting…
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Submit Place
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
          {["all", "pending", "flagged", "active"].map((status) => (
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
          <div className="text-center py-12 space-y-2">
            <CheckCircle className="h-12 w-12 text-emerald-300 mx-auto" />
            <p className="text-muted-foreground font-medium">All clear!</p>
            <p className="text-sm text-muted-foreground">
              No places match the current filter.
            </p>
          </div>
        ) : (
          filtered.map((place) => {
            const config = statusConfig[place.status];
            const StatusIcon = config.icon;

            return (
              <div
                key={place.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl bg-card border hover:shadow-sm transition-all",
                  place.status === "flagged"
                    ? "border-red-200 bg-red-50/30"
                    : place.status === "pending"
                      ? "border-amber-200 bg-amber-50/30"
                      : "border-border",
                )}
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
                    {place.rating > 0 && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 text-secondary fill-secondary" />{" "}
                          {place.rating}
                        </span>
                      </>
                    )}
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

                  {(place.status === "pending" ||
                    place.status === "flagged") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleApprove(place.id)}
                      className="text-xs gap-1 h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                    >
                      <CheckCircle className="h-3.5 w-3.5" /> Approve
                    </Button>
                  )}

                  {place.status === "active" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFlag(place.id)}
                      className="text-xs gap-1 h-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                    >
                      <Flag className="h-3.5 w-3.5" /> Flag
                    </Button>
                  )}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs gap-1 h-8 text-destructive hover:text-destructive"
                        title="Escalate for deletion"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Escalate for Deletion
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          You don't have permission to permanently delete
                          places. This will escalate "{place.name}" to admin for
                          final deletion. The place will be removed from your
                          queue.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            handleEscalateDelete(place.id, place.name)
                          }
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Escalate to Admin
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

      {/* Info Note */}
      <div className="p-4 rounded-xl bg-secondary/5 border border-secondary/20">
        <p className="text-sm text-foreground">
          <span className="font-medium">ℹ️ Note:</span> As a moderator, you can
          approve, flag, or submit new places. Deletions are escalated to an
          admin for final review.
        </p>
      </div>
    </div>
  );
};

export default ModeratePlacesPage;
