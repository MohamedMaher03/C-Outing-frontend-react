/**
 * Manage Categories Page (Admin)
 *
 * CRUD operations on venue categories.
 */

import { useState, useEffect } from "react";
import {
  Layers,
  Edit2,
  ToggleLeft,
  ToggleRight,
  Plus,
  Save,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { cn } from "@/lib/utils";
import { adminMock } from "@/features/admin/mocks/adminMock";
import type { AdminCategory } from "@/features/admin/types";

const ManageCategoriesPage = () => {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await adminMock.getCategories();
        setCategories(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleToggleStatus = async (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    if (!cat) return;
    const newStatus = cat.status === "active" ? "inactive" : "active";
    await adminMock.updateCategory(catId, { status: newStatus });
    setCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, status: newStatus } : c)),
    );
  };

  const handleStartEdit = (cat: AdminCategory) => {
    setEditingId(cat.id);
    setEditLabel(cat.label);
  };

  const handleSaveEdit = async (catId: string) => {
    if (!editLabel.trim()) return;
    await adminMock.updateCategory(catId, { label: editLabel.trim() });
    setCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, label: editLabel.trim() } : c)),
    );
    setEditingId(null);
  };

  const handleAddCategory = () => {
    if (!newLabel.trim()) return;
    const newCat: AdminCategory = {
      id: newLabel.toLowerCase().replace(/\s+/g, "-"),
      label: newLabel.trim(),
      icon: "Compass",
      count: 0,
      color: "bg-gray-100",
      status: "active",
    };
    setCategories((prev) => [...prev, newCat]);
    setNewLabel("");
    setShowAdd(false);
  };

  if (loading) {
    return <LoadingSpinner size="md" text="Loading categories..." fullScreen />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Layers className="h-6 w-6 text-secondary" />
            Manage Categories
          </h1>
          <p className="text-sm text-muted-foreground">
            {categories.length} categories ·{" "}
            {categories.filter((c) => c.status === "active").length} active
          </p>
        </div>
        <Button
          onClick={() => setShowAdd(!showAdd)}
          className="gap-1 bg-primary text-primary-foreground hover:bg-navy-light"
          size="sm"
        >
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      {/* Add Category Form */}
      {showAdd && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <Label className="text-sm font-medium">New Category Name</Label>
          <div className="flex gap-3">
            <Input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="e.g., Rooftop Lounges"
              className="flex-1"
            />
            <Button onClick={handleAddCategory} size="sm" className="gap-1">
              <Save className="h-4 w-4" /> Save
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowAdd(false);
                setNewLabel("");
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="space-y-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className={cn(
              "flex items-center gap-4 p-4 rounded-xl bg-card border transition-all",
              cat.status === "inactive"
                ? "border-border/50 opacity-60"
                : "border-border hover:border-secondary/30 hover:shadow-sm",
            )}
          >
            {/* Color dot + icon */}
            <div
              className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center",
                cat.color,
              )}
            >
              <span className="text-lg">
                {cat.icon === "UtensilsCrossed"
                  ? "🍽️"
                  : cat.icon === "Moon"
                    ? "🌙"
                    : cat.icon === "Palette"
                      ? "🎨"
                      : cat.icon === "Trees"
                        ? "🌳"
                        : cat.icon === "ShoppingBag"
                          ? "🛍️"
                          : cat.icon === "Heart"
                            ? "❤️"
                            : cat.icon === "Compass"
                              ? "🧭"
                              : cat.icon === "Laptop"
                                ? "💻"
                                : "📍"}
              </span>
            </div>

            {/* Label */}
            <div className="flex-1 min-w-0">
              {editingId === cat.id ? (
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
                    onClick={() => handleSaveEdit(cat.id)}
                  >
                    <Save className="h-3 w-3" /> Save
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8"
                    onClick={() => setEditingId(null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
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
            <div className="flex items-center gap-3 flex-shrink-0">
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] px-1.5 py-0",
                  cat.status === "active"
                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                    : "bg-gray-100 text-gray-500 border-gray-200",
                )}
              >
                {cat.status}
              </Badge>

              {editingId !== cat.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleStartEdit(cat)}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
              )}

              <button
                onClick={() => handleToggleStatus(cat.id)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title={cat.status === "active" ? "Deactivate" : "Activate"}
              >
                {cat.status === "active" ? (
                  <ToggleRight className="h-6 w-6 text-emerald-500" />
                ) : (
                  <ToggleLeft className="h-6 w-6 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageCategoriesPage;
