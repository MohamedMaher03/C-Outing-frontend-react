import { useCallback, useEffect, useRef, useState } from "react";
import { adminService } from "@/features/admin/services/adminService";
import type { AdminCategory } from "@/features/admin/types";
import { getErrorMessage } from "@/utils/apiError";
import { useI18n } from "@/components/i18n";

interface UseManageCategoriesReturn {
  categories: AdminCategory[];
  loading: boolean;
  error: string | null;
  processingCategoryId: string | null;
  editingId: string | null;
  editLabel: string;
  editIcon: string;
  showAdd: boolean;
  newLabel: string;
  newIcon: string;
  setEditLabel: (value: string) => void;
  setEditIcon: (value: string) => void;
  setShowAdd: (value: boolean) => void;
  setNewLabel: (value: string) => void;
  setNewIcon: (value: string) => void;
  retry: () => Promise<void>;
  handleToggleStatus: (catId: string) => Promise<void>;
  handleStartEdit: (cat: AdminCategory) => void;
  handleSaveEdit: (catId: string) => Promise<void>;
  handleCancelEdit: () => void;
  handleAddCategory: () => void;
}

export const useManageCategories = (): UseManageCategoriesReturn => {
  const { t } = useI18n();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingCategoryId, setProcessingCategoryId] = useState<
    string | null
  >(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editIcon, setEditIcon] = useState<string>("Compass");
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newIcon, setNewIcon] = useState<string>("Compass");
  const mountedRef = useRef(true);
  const inFlightRef = useRef(new Set<string>());

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await adminService.getCategories();
      if (!mountedRef.current) return;
      setCategories(data);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(getErrorMessage(err, t("admin.error.loadCategories")));
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [t]);

  useEffect(() => {
    mountedRef.current = true;
    void loadCategories();

    return () => {
      mountedRef.current = false;
    };
  }, [loadCategories]);

  const handleToggleStatus = async (catId: string) => {
    if (inFlightRef.current.has(catId)) {
      return;
    }

    const cat = categories.find((c) => c.id === catId);
    if (!cat) return;

    const newStatus = cat.status === "active" ? "inactive" : "active";

    inFlightRef.current.add(catId);
    setProcessingCategoryId(catId);
    setError(null);

    try {
      await adminService.updateCategory(catId, { status: newStatus });
      if (!mountedRef.current) return;

      setCategories((prev) =>
        prev.map((c) => (c.id === catId ? { ...c, status: newStatus } : c)),
      );
    } catch (err) {
      if (!mountedRef.current) return;
      setError(getErrorMessage(err, t("admin.error.updateCategoryStatus")));
    } finally {
      inFlightRef.current.delete(catId);
      if (mountedRef.current) {
        setProcessingCategoryId((prev) => (prev === catId ? null : prev));
      }
    }
  };

  const handleStartEdit = (cat: AdminCategory) => {
    setError(null);
    setEditingId(cat.id);
    setEditLabel(cat.label);
    setEditIcon(cat.icon ?? "Compass");
  };

  const handleSaveEdit = async (catId: string) => {
    const normalizedLabel = editLabel.trim();

    if (!normalizedLabel) {
      setError(t("admin.categories.error.nameRequired"));
      return;
    }

    if (normalizedLabel.length > 60) {
      setError(t("admin.categories.error.nameMax", { max: 60 }));
      return;
    }

    if (inFlightRef.current.has(catId)) {
      return;
    }

    inFlightRef.current.add(catId);
    setProcessingCategoryId(catId);
    setError(null);

    try {
      await adminService.updateCategory(catId, {
        label: normalizedLabel,
        icon: editIcon,
      });

      if (!mountedRef.current) return;

      setCategories((prev) =>
        prev.map((c) =>
          c.id === catId ? { ...c, label: normalizedLabel, icon: editIcon } : c,
        ),
      );
      setEditingId(null);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(getErrorMessage(err, t("admin.error.saveCategoryChanges")));
    } finally {
      inFlightRef.current.delete(catId);
      if (mountedRef.current) {
        setProcessingCategoryId((prev) => (prev === catId ? null : prev));
      }
    }
  };

  const handleCancelEdit = () => {
    setError(null);
    setEditingId(null);
  };

  const handleAddCategory = () => {
    const normalizedLabel = newLabel.trim();

    if (!normalizedLabel) {
      setError(t("admin.categories.error.nameRequired"));
      return;
    }

    if (normalizedLabel.length > 60) {
      setError(t("admin.categories.error.nameMax", { max: 60 }));
      return;
    }

    const normalizedId = normalizedLabel.toLowerCase().replace(/\s+/g, "-");
    const hasDuplicate = categories.some((cat) => cat.id === normalizedId);

    if (hasDuplicate) {
      setError(t("admin.categories.error.nameDuplicate"));
      return;
    }

    setError(null);

    const newCat: AdminCategory = {
      id: normalizedId,
      label: normalizedLabel,
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
    retry: loadCategories,
    handleToggleStatus,
    handleStartEdit,
    handleSaveEdit,
    handleCancelEdit,
    handleAddCategory,
  };
};
