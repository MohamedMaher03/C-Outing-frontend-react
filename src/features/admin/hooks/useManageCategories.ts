/**
 * useManageCategories Hook
 * Manages state and actions for the Manage Categories admin page.
 */

import { useState, useEffect } from "react";
import { adminService } from "@/features/admin/services/adminService";
import type { AdminCategory } from "@/features/admin/types";

interface UseManageCategoriesReturn {
  // State
  categories: AdminCategory[];
  loading: boolean;
  editingId: string | null;
  editLabel: string;
  editIcon: string;
  showAdd: boolean;
  newLabel: string;
  newIcon: string;

  // Setters
  setEditLabel: (value: string) => void;
  setEditIcon: (value: string) => void;
  setShowAdd: (value: boolean) => void;
  setNewLabel: (value: string) => void;
  setNewIcon: (value: string) => void;

  // Actions
  handleToggleStatus: (catId: string) => Promise<void>;
  handleStartEdit: (cat: AdminCategory) => void;
  handleSaveEdit: (catId: string) => Promise<void>;
  handleCancelEdit: () => void;
  handleAddCategory: () => void;
}

export const useManageCategories = (): UseManageCategoriesReturn => {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editIcon, setEditIcon] = useState<string>("Compass");
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newIcon, setNewIcon] = useState<string>("Compass");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await adminService.getCategories();
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
    await adminService.updateCategory(catId, { status: newStatus });
    setCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, status: newStatus } : c)),
    );
  };

  const handleStartEdit = (cat: AdminCategory) => {
    setEditingId(cat.id);
    setEditLabel(cat.label);
    setEditIcon(cat.icon ?? "Compass");
  };

  const handleSaveEdit = async (catId: string) => {
    if (!editLabel.trim()) return;
    await adminService.updateCategory(catId, {
      label: editLabel.trim(),
      icon: editIcon,
    });
    setCategories((prev) =>
      prev.map((c) =>
        c.id === catId ? { ...c, label: editLabel.trim(), icon: editIcon } : c,
      ),
    );
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleAddCategory = () => {
    if (!newLabel.trim()) return;
    const newCat: AdminCategory = {
      id: newLabel.toLowerCase().replace(/\s+/g, "-"),
      label: newLabel.trim(),
      icon: newIcon,
      count: 0,
      color: "bg-gray-100",
      status: "active",
    };
    setCategories((prev) => [...prev, newCat]);
    setNewLabel("");
    setNewIcon("Compass");
    setShowAdd(false);
  };

  return {
    categories,
    loading,
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
    handleToggleStatus,
    handleStartEdit,
    handleSaveEdit,
    handleCancelEdit,
    handleAddCategory,
  };
};
