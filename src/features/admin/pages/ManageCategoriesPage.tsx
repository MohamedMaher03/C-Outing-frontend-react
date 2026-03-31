/**
 * Manage Categories Page (Admin)
 *
 * CRUD operations on venue categories. Includes icon picker using Lucide icons.
 */

import {
  Layers,
  Edit2,
  ToggleLeft,
  ToggleRight,
  Plus,
  Save,
  X,
  MapPin,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { cn } from "@/lib/utils";
import { useManageCategories } from "@/features/admin/hooks/useManageCategories";
import {
  AdminErrorBanner,
  AdminPageHeader,
  AdminPageLayout,
  AdminSection,
} from "@/features/admin/components";
import { CURATED_CATEGORY_ICONS } from "@/features/admin/constants/categoryIcons";

// ── Icon Picker Data ───────────────────────────────────────────

const ICON_MAP: Record<
  string,
  React.ComponentType<{ className?: string }>
> = Object.fromEntries(
  CURATED_CATEGORY_ICONS.map(({ name, icon }) => [name, icon]),
);

const CategoryIcon = ({
  name,
  className,
}: {
  name: string;
  className?: string;
}) => {
  const IconComp = ICON_MAP[name] ?? MapPin;
  return <IconComp className={className} />;
};

// ── Component ─────────────────────────────────────────────────

const ManageCategoriesPage = () => {
  const {
    categories,
    loading,
    error,
    processingCategoryId,
    editingId,
    editLabel,
    editIcon,
    showAdd,
    newLabel,
    newIcon,
    setEditLabel,
    setEditIcon,
    setShowAdd,
    setNewLabel,
    setNewIcon,
    retry,
    handleToggleStatus,
    handleStartEdit,
    handleSaveEdit,
    handleCancelEdit,
    handleAddCategory,
  } = useManageCategories();

  if (loading) {
    return <LoadingSpinner size="md" text="Loading categories..." fullScreen />;
  }

  return (
    <AdminPageLayout maxWidth="4xl">
      {/* Header */}
      <AdminPageHeader
        title="Manage Categories"
        description={`${categories.length} categories · ${categories.filter((c) => c.status === "active").length} active`}
        icon={Layers}
        actions={
          <Button
            onClick={() => setShowAdd(!showAdd)}
            className="w-full gap-1 sm:w-auto"
            size="sm"
            aria-expanded={showAdd}
            aria-controls="category-add-panel"
          >
            <Plus className="h-4 w-4" /> Add Category
          </Button>
        }
      />

      <AdminErrorBanner
        title="Couldn't update categories"
        message={error}
        onRetry={() => {
          void retry();
        }}
      />

      {/* Add Category Form */}
      {showAdd && (
        <AdminSection
          title="Create Category"
          description="Add a new category and assign a fitting icon"
          tone="surface"
          className="py-0"
        >
          <div id="category-add-panel" className="space-y-1.5">
            <Label className="text-sm font-medium">New Category Name</Label>
            <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:gap-3">
              <Input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="e.g., Rooftop Lounges"
                className="flex-1"
              />
              <Button
                onClick={handleAddCategory}
                size="sm"
                className="w-full gap-1 sm:w-auto"
              >
                <Save className="h-4 w-4" /> Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full sm:w-auto"
                aria-label="Cancel adding category"
                onClick={() => {
                  setShowAdd(false);
                  setNewLabel("");
                  setNewIcon("Compass");
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Icon</Label>
            <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5">
              {CURATED_CATEGORY_ICONS.map(({ name, icon: IconComp }) => (
                <button
                  key={name}
                  type="button"
                  title={name}
                  aria-label={`Choose icon ${name}`}
                  onClick={() => setNewIcon(name)}
                  className={cn(
                    "flex min-h-11 min-w-11 items-center justify-center rounded-lg border transition-all motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:h-9 sm:w-9",
                    newIcon === name
                      ? "bg-secondary/20 border-secondary text-secondary"
                      : "border-border text-muted-foreground hover:border-secondary/50 hover:text-foreground",
                  )}
                >
                  <IconComp className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
        </AdminSection>
      )}

      <AdminSection
        title="Category Records"
        description="Toggle activation and keep labels/iconography up to date"
        contentClassName="gap-3"
      >
        {categories.map((cat) => {
          const isProcessing = processingCategoryId === cat.id;

          return (
            <div
              key={cat.id}
              className={cn(
                "flex flex-col gap-4 rounded-xl border bg-card p-4 transition-all motion-reduce:transition-none sm:flex-row sm:items-center",
                cat.status === "inactive"
                  ? "border-border/50 opacity-60"
                  : "border-border hover:border-secondary/30 hover:shadow-sm",
              )}
            >
              {/* Color dot + icon */}
              <div
                className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0",
                  cat.color,
                )}
              >
                <CategoryIcon name={cat.icon ?? "MapPin"} className="h-5 w-5" />
              </div>

              {/* Label */}
              <div className="flex-1 min-w-0">
                {editingId === cat.id ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        className="h-8 text-sm"
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleSaveEdit(cat.id)
                        }
                      />
                      <Button
                        size="sm"
                        className="h-8 gap-1"
                        onClick={() => void handleSaveEdit(cat.id)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Save className="h-3 w-3" />
                        )}{" "}
                        Save
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8"
                        aria-label="Cancel editing category"
                        onClick={() => handleCancelEdit()}
                        disabled={isProcessing}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-6 sm:grid-cols-10 gap-1">
                      {CURATED_CATEGORY_ICONS.map(
                        ({ name, icon: IconComp }) => (
                          <button
                            key={name}
                            type="button"
                            title={name}
                            aria-label={`Set icon to ${name}`}
                            onClick={() => setEditIcon(name)}
                            disabled={isProcessing}
                            className={cn(
                              "flex min-h-11 min-w-11 items-center justify-center rounded-lg border transition-all motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:h-8 sm:w-8",
                              editIcon === name
                                ? "bg-secondary/20 border-secondary text-secondary"
                                : "border-border text-muted-foreground hover:border-secondary/50 hover:text-foreground",
                            )}
                          >
                            <IconComp className="h-3.5 w-3.5" />
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {cat.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {cat.count} places
                    </p>
                  </div>
                )}
              </div>

              {/* Status + Actions */}
              <div className="flex items-center justify-end gap-3 flex-shrink-0 w-full sm:w-auto">
                <Badge
                  variant="outline"
                  className={cn(
                    "px-1.5 py-0 text-role-caption",
                    cat.status === "active"
                      ? "bg-primary/10 text-primary border-primary/25"
                      : "bg-muted text-muted-foreground border-border",
                  )}
                >
                  {cat.status}
                </Badge>

                {editingId !== cat.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStartEdit(cat)}
                    className="min-h-11 min-w-11 sm:h-8 sm:w-8 p-0"
                    aria-label={`Edit ${cat.label}`}
                    disabled={isProcessing}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                )}

                <button
                  type="button"
                  onClick={() => void handleToggleStatus(cat.id)}
                  className="min-h-11 min-w-11 text-muted-foreground transition-colors motion-reduce:transition-none hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:min-h-0 sm:min-w-0"
                  title={cat.status === "active" ? "Deactivate" : "Activate"}
                  aria-label={
                    cat.status === "active"
                      ? `Deactivate ${cat.label}`
                      : `Activate ${cat.label}`
                  }
                  disabled={isProcessing}
                >
                  {cat.status === "active" ? (
                    <ToggleRight className="h-6 w-6 text-primary" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </AdminSection>
    </AdminPageLayout>
  );
};

export default ManageCategoriesPage;
