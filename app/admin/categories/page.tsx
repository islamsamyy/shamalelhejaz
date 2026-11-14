"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  FolderTree,
  PlusCircle,
  Trash2,
  Edit3,
  Search,
  Eye,
  EyeOff,
  Layers,
  Sparkles,
  Percent,
  Receipt,
  X,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface SubCategory {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  productsCount: number;
}

interface ParentCategory {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  commission: number;
  vatRate: number;
  icon: string;
  active: boolean;
  subcategories: SubCategory[];
}

const POPULAR_ICON_OPTIONS = [
  { name: "headphones", label: "سماعات" },
  { name: "smartphone", label: "هواتف" },
  { name: "coffee", label: "مطبخ وقهوة" },
  { name: "sparkles", label: "عناية وجمال" },
  { name: "watch", label: "ساعات" },
  { name: "diamond", label: "مجوهرات" },
  { name: "shopping_bag", label: "حقائب" },
  { name: "devices", label: "إلكترونيات" },
  { name: "fitness_center", label: "رياضة" },
  { name: "palette", label: "فنون وتراث" },
];

export default function TaxonomyBuilderPage() {
  const [categories, setCategories] = useState<ParentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "hidden">("all");

  // Add Category Dialog
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newNameAr, setNewNameAr] = useState("");
  const [newNameEn, setNewNameEn] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newCommission, setNewCommission] = useState(8);
  const [newIcon, setNewIcon] = useState("headphones");

  // Edit Category Dialog
  const [editCategory, setEditCategory] = useState<ParentCategory | null>(null);
  const [editNameAr, setEditNameAr] = useState("");
  const [editNameEn, setEditNameEn] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editCommission, setEditCommission] = useState(8);
  const [editIcon, setEditIcon] = useState("headphones");

  // Add Subcategory Dialog
  const [subParent, setSubParent] = useState<ParentCategory | null>(null);
  const [subNameAr, setSubNameAr] = useState("");

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.warn("Could not load categories from Supabase:", error.message);
        return;
      }

      // Map Supabase rows cleanly to ParentCategory interface
      const mapped: ParentCategory[] = (data || []).map((row: any) => {
        const rawSubs = Array.isArray(row.subcategories) ? row.subcategories : [];
        return {
          id: row.id,
          nameAr: row.title,
          nameEn: row.name_en || row.subtitle || "",
          slug: row.slug,
          commission: Number(row.commission ?? 8),
          vatRate: Number(row.vat_rate ?? 15),
          icon: row.icon_name || "category",
          active: row.is_active !== false,
          subcategories: rawSubs.map((s: any, idx: number) => ({
            id: s.id || `${row.id}-sub-${idx}`,
            nameAr: s.name || s.nameAr || String(s),
            nameEn: s.nameEn || "",
            slug: s.slug || "",
            productsCount: Number(s.productsCount ?? 0),
          })),
        };
      });
      setCategories(mapped);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = categories.length;
    const activeCount = categories.filter((c) => c.active).length;
    const totalSubs = categories.reduce((sum, c) => sum + c.subcategories.length, 0);
    const avgCommission =
      total > 0
        ? Math.round((categories.reduce((sum, c) => sum + c.commission, 0) / total) * 10) / 10
        : 8;
    return { total, activeCount, totalSubs, avgCommission };
  }, [categories]);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return categories.filter((cat) => {
      const matchesSearch =
        !q ||
        cat.nameAr.toLowerCase().includes(q) ||
        cat.nameEn.toLowerCase().includes(q) ||
        cat.slug.toLowerCase().includes(q) ||
        cat.subcategories.some((s) => s.nameAr.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === "all" ? true : statusFilter === "active" ? cat.active : !cat.active;

      return matchesSearch && matchesStatus;
    });
  }, [categories, searchQuery, statusFilter]);

  // Render category icon safely without text spill
  const renderCategoryIcon = (iconName: string) => {
    if (!iconName) {
      return <span className="material-symbols-outlined text-2xl text-[#006948]">category</span>;
    }
    // If it's a known material icon identifier
    if (/^[a-z0-9_-]+$/i.test(iconName)) {
      return (
        <span className="material-symbols-outlined text-2xl text-[#006948] select-none leading-none">
          {iconName}
        </span>
      );
    }
    // Otherwise render as emoji or text snippet with containment
    return <span className="text-xl select-none leading-none">{iconName}</span>;
  };

  const handleAddCategory = async () => {
    if (!newNameAr.trim()) {
      toast.error("يرجى إدخال اسم القسم بالعربية");
      return;
    }
    const slug = (newSlug.trim() || newNameEn.trim() || `cat-${Date.now()}`)
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-|-$/g, "") || `cat-${Date.now()}`;

    const { error } = await supabase.from("categories").insert([
      {
        id: slug,
        title: newNameAr.trim(),
        subtitle: newNameEn.trim() || newNameAr.trim(),
        name_en: newNameEn.trim() || newNameAr.trim(),
        slug,
        icon_name: newIcon || "category",
        commission: Number(newCommission),
        vat_rate: 15,
        is_active: true,
        subcategories: [],
      },
    ]);

    if (error) {
      toast.error(`تعذر إنشاء القسم: ${error.message}`);
      return;
    }

    toast.success(`تم إنشاء القسم الرئيسي "${newNameAr}" وحفظه بنجاح!`);
    setIsAddOpen(false);
    setNewNameAr("");
    setNewNameEn("");
    setNewSlug("");
    setNewCommission(8);
    setNewIcon("headphones");
    loadCategories();
  };

  const handleOpenEdit = (cat: ParentCategory) => {
    setEditCategory(cat);
    setEditNameAr(cat.nameAr);
    setEditNameEn(cat.nameEn);
    setEditSlug(cat.slug);
    setEditCommission(cat.commission);
    setEditIcon(cat.icon);
  };

  const handleSaveEdit = async () => {
    if (!editCategory || !editNameAr.trim()) return;

    const { error } = await supabase
      .from("categories")
      .update({
        title: editNameAr.trim(),
        name_en: editNameEn.trim(),
        subtitle: editNameEn.trim(),
        slug: editSlug.trim(),
        commission: Number(editCommission),
        icon_name: editIcon,
      })
      .eq("id", editCategory.id);

    if (error) {
      toast.error(`تعذر حفظ التعديلات: ${error.message}`);
      return;
    }

    toast.success(`تم تحديث القسم "${editNameAr}" بنجاح!`);
    setEditCategory(null);
    loadCategories();
  };

  const handleToggleActive = async (cat: ParentCategory) => {
    const nextActive = !cat.active;
    const { error } = await supabase
      .from("categories")
      .update({ is_active: nextActive })
      .eq("id", cat.id);

    if (error) {
      toast.error(`تعذر تحديث القسم: ${error.message}`);
      return;
    }

    setCategories((prev) =>
      prev.map((c) => (c.id === cat.id ? { ...c, active: nextActive } : c))
    );
    toast.info(`تم ${nextActive ? "تفعيل وعرض" : "إخفاء"} القسم "${cat.nameAr}" في المتجر.`);
  };

  const handleDeleteCategory = async (cat: ParentCategory) => {
    if (!confirm(`هل أنت متأكد من حذف قسم "${cat.nameAr}" وجميع تصنيفاته؟`)) return;

    const { error } = await supabase.from("categories").delete().eq("id", cat.id);
    if (error) {
      toast.error(`تعذر حذف القسم: ${error.message}`);
      return;
    }
    setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    toast.success(`تم حذف القسم "${cat.nameAr}".`);
  };

  const handleAddSubcategory = async () => {
    if (!subParent || !subNameAr.trim()) return;
    const nextSubs = [
      ...subParent.subcategories.map((s) => ({
        id: s.id,
        name: s.nameAr,
        productsCount: s.productsCount,
      })),
      {
        id: `${subParent.id}-sub-${Date.now()}`,
        name: subNameAr.trim(),
        productsCount: 0,
      },
    ];

    const { error } = await supabase
      .from("categories")
      .update({ subcategories: nextSubs })
      .eq("id", subParent.id);

    if (error) {
      toast.error(`تعذر إضافة التصنيف الفرعي: ${error.message}`);
      return;
    }

    toast.success(`تمت إضافة التصنيف الفرعي "${subNameAr}" تحت "${subParent.nameAr}"!`);
    setSubParent(null);
    setSubNameAr("");
    loadCategories();
  };

  const handleDeleteSubcategory = async (cat: ParentCategory, subId: string) => {
    const nextSubs = cat.subcategories
      .filter((s) => s.id !== subId)
      .map((s) => ({
        id: s.id,
        name: s.nameAr,
        productsCount: s.productsCount,
      }));

    const { error } = await supabase
      .from("categories")
      .update({ subcategories: nextSubs })
      .eq("id", cat.id);

    if (error) {
      toast.error(`تعذر إزالة التصنيف الفرعي: ${error.message}`);
      return;
    }

    toast.success("تم حذف التصنيف الفرعي بنجاح.");
    loadCategories();
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              قاعدة بيانات Supabase المباشرة
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
            <FolderTree className="w-8 h-8 text-[#006948]" />
            هندسة وبناء هيكل الأقسام (Taxonomy Builder)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            إدارة شجرة الأقسام الرئيسية والفرعية، ضبط نسب العمولات، والتحكم الفوري في حالة عرضها بالمتجر.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadCategories}
            disabled={loading}
            className="rounded-2xl text-xs font-bold h-10 px-3.5"
            title="تحديث البيانات من Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline me-1">تحديث</span>
          </Button>

          <Button
            variant="sovereign"
            size="sm"
            onClick={() => setIsAddOpen(true)}
            className="rounded-2xl font-bold text-xs h-10 px-4 shadow-md shadow-[#006948]/20"
          >
            <PlusCircle className="w-4 h-4 me-1.5" />
            إضافة قسم رئيسي جديد
          </Button>
        </div>
      </div>

      {/* 4 Interactive KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-bold text-slate-400 block mb-1">إجمالي الأقسام</span>
            <span className="text-2xl font-black text-slate-900">{stats.total} قسم</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <FolderTree className="w-5 h-5" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-bold text-slate-400 block mb-1">الأقسام النشطة</span>
            <span className="text-2xl font-black text-emerald-700">{stats.activeCount} نشط</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-bold text-slate-400 block mb-1">التصنيفات الفرعية</span>
            <span className="text-2xl font-black text-amber-700">{stats.totalSubs} تصنيف</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-bold text-slate-400 block mb-1">متوسط عمولة المنصة</span>
            <span className="text-2xl font-black text-[#006948] font-mono">{stats.avgCommission}%</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <Percent className="w-5 h-5" />
          </div>
        </motion.div>
      </div>

      {/* Filter and Search Controls Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
        {/* Search Input */}
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالاسم العربي، الإنجليزي، الـ slug، أو التصنيف الفرعي..."
            className="ps-10 pe-4 rounded-2xl border-slate-200 text-xs h-10 bg-slate-50/70 focus:bg-white"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold shrink-0 w-full sm:w-auto justify-center">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              statusFilter === "all"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            الكل ({categories.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("active")}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              statusFilter === "active"
                ? "bg-[#006948] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            النشطة ({stats.activeCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("hidden")}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              statusFilter === "hidden"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            المخفية ({stats.total - stats.activeCount})
          </button>
        </div>
      </div>

      {/* Category Tree Cards Grid */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredCategories.map((cat) => (
            <motion.div
              key={cat.id}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 transition-all hover:border-emerald-300 hover:shadow-md"
            >
              {/* Category Header Row */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                {/* Right: Icon Box & Names */}
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Fixed Size Icon Box - No Overflow */}
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                    {renderCategoryIcon(cat.icon)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-slate-900 text-base truncate">
                        {cat.nameAr}
                      </h3>
                      <Badge
                        variant={cat.active ? "sovereign" : "outline"}
                        className={`text-[10px] px-2 py-0.5 font-bold shrink-0 ${
                          cat.active
                            ? "bg-emerald-500/10 text-emerald-800 border-emerald-300"
                            : "bg-slate-100 text-slate-500 border-slate-200"
                        }`}
                      >
                        {cat.active ? "نشط بالمتجر" : "مخفي مؤقتاً"}
                      </Badge>
                    </div>

                    {/* Subtitle & Slug - Fixed Arabic font ligature bug */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 mt-1">
                      {cat.nameEn && (
                        <span className="font-normal text-slate-600 line-clamp-1">
                          {cat.nameEn}
                        </span>
                      )}
                      <span className="text-slate-300 hidden sm:inline">•</span>
                      <span
                        className="font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 text-[11px] font-semibold"
                        dir="ltr"
                      >
                        /{cat.slug}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Left: Action Pills & Buttons */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold shrink-0">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400 font-medium">عمولة القسم:</span>
                    <span className="font-mono text-[#006948] font-black">{cat.commission}%</span>
                  </div>

                  <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400 font-medium">ضريبة زاتكا:</span>
                    <span className="font-mono text-emerald-800 font-black">{cat.vatRate}%</span>
                  </div>

                  {/* Edit Category Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(cat)}
                    className="rounded-xl text-xs h-8 px-3 text-slate-700 hover:text-[#006948] hover:bg-emerald-50 border-slate-200"
                    title="تعديل بيانات القسم"
                  >
                    <Edit3 className="w-3.5 h-3.5 me-1 text-slate-500" />
                    <span>تعديل</span>
                  </Button>

                  {/* Toggle Active Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(cat)}
                    className="rounded-xl text-xs h-8 px-3 border-slate-200"
                    title={cat.active ? "إخفاء القسم من المتجر" : "تفعيل القسم في المتجر"}
                  >
                    {cat.active ? (
                      <span className="flex items-center gap-1 text-slate-600">
                        <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                        <span>إخفاء</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-800">
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        <span>تفعيل</span>
                      </span>
                    )}
                  </Button>

                  {/* Delete Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCategory(cat)}
                    className="rounded-xl text-xs h-8 px-2.5 text-rose-600 border-slate-200 hover:bg-rose-50"
                    title="حذف القسم"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Sub-categories Badges Matrix */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    الأقسام والتصنيفات الفرعية ({cat.subcategories.length}):
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {cat.subcategories.map((sub) => (
                    <div
                      key={sub.id}
                      className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs transition-colors"
                    >
                      <span className="font-bold text-slate-800">{sub.nameAr}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteSubcategory(cat, sub.id)}
                        className="opacity-40 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition-opacity cursor-pointer p-0.5 rounded-full"
                        title="إزالة هذا التصنيف الفرعي"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      setSubParent(cat);
                      setSubNameAr("");
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/40 text-emerald-800 hover:bg-emerald-50 hover:border-emerald-500 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-[#006948]" />
                    <span>تصنيف فرعي جديد</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {!loading && filteredCategories.length === 0 && (
          <div className="text-center py-12 text-slate-400 bg-white rounded-3xl border border-slate-200 space-y-2">
            <FolderTree className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-600">لا توجد أقسام مطابقة للبحث</p>
            <p className="text-xs text-slate-400">جرب البحث بكلمات أخرى أو تغيير خيار التصفية.</p>
          </div>
        )}
      </div>

      {/* Add Category Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-lg rounded-3xl p-6 sm:p-8 font-sans">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-[#006948]" />
              إضافة قسم تصنيفي رئيسي جديد
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 my-2 text-xs">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                اسم القسم بالعربية:
              </label>
              <Input
                value={newNameAr}
                onChange={(e) => setNewNameAr(e.target.value)}
                placeholder="مثال: الخيول ولوازم الفروسية"
                className="rounded-2xl text-xs h-10"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                وصف القسم أو الاسم بالإنجليزية:
              </label>
              <Input
                value={newNameEn}
                onChange={(e) => setNewNameEn(e.target.value)}
                placeholder="مثال: أحدث عتاد وسروج الخيل وأطقم الفروسية"
                className="rounded-2xl text-xs h-10"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                معرف الرابط الإنجليزي (Slug):
              </label>
              <Input
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                placeholder="equestrian-horses"
                dir="ltr"
                className="rounded-2xl text-xs font-mono h-10"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  نسبة عمولة المنصة (%):
                </label>
                <Input
                  type="number"
                  value={newCommission}
                  onChange={(e) => setNewCommission(Number(e.target.value))}
                  className="rounded-2xl text-xs font-bold font-mono h-10"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  رمز الأيقونة (Material Symbol / Emoji):
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    value={newIcon}
                    onChange={(e) => setNewIcon(e.target.value)}
                    placeholder="headphones"
                    className="rounded-2xl text-xs h-10 font-mono text-center flex-1"
                  />
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                    {renderCategoryIcon(newIcon)}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Icon Selector Chips */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                أيقونات شائعة سريعة الاختيار:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_ICON_OPTIONS.map((opt) => (
                  <button
                    key={opt.name}
                    type="button"
                    onClick={() => setNewIcon(opt.name)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border flex items-center gap-1 transition-all cursor-pointer ${
                      newIcon === opt.name
                        ? "bg-[#006948] text-white border-[#006948]"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">{opt.name}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2 sm:justify-start pt-2 border-t border-slate-100">
            <Button
              variant="sovereign"
              size="sm"
              onClick={handleAddCategory}
              className="rounded-2xl font-bold text-xs h-10 px-5"
            >
              حفظ ونشر القسم
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddOpen(false)}
              className="rounded-2xl text-xs h-10 px-4"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={!!editCategory} onOpenChange={() => setEditCategory(null)}>
        <DialogContent className="max-w-lg rounded-3xl p-6 sm:p-8 font-sans">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-[#006948]" />
              تعديل بيانات القسم: {editCategory?.nameAr}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 my-2 text-xs">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                اسم القسم بالعربية:
              </label>
              <Input
                value={editNameAr}
                onChange={(e) => setEditNameAr(e.target.value)}
                className="rounded-2xl text-xs h-10"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                الوصف / الاسم الإنجليزي:
              </label>
              <Input
                value={editNameEn}
                onChange={(e) => setEditNameEn(e.target.value)}
                className="rounded-2xl text-xs h-10"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                معرف الرابط (Slug):
              </label>
              <Input
                value={editSlug}
                onChange={(e) => setEditSlug(e.target.value)}
                dir="ltr"
                className="rounded-2xl text-xs font-mono h-10"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  نسبة عمولة المنصة (%):
                </label>
                <Input
                  type="number"
                  value={editCommission}
                  onChange={(e) => setEditCommission(Number(e.target.value))}
                  className="rounded-2xl text-xs font-bold font-mono h-10"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  رمز الأيقونة:
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    value={editIcon}
                    onChange={(e) => setEditIcon(e.target.value)}
                    className="rounded-2xl text-xs h-10 font-mono text-center flex-1"
                  />
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                    {renderCategoryIcon(editIcon)}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Icon Selector Chips */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                أيقونات مقترحة:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_ICON_OPTIONS.map((opt) => (
                  <button
                    key={opt.name}
                    type="button"
                    onClick={() => setEditIcon(opt.name)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border flex items-center gap-1 transition-all cursor-pointer ${
                      editIcon === opt.name
                        ? "bg-[#006948] text-white border-[#006948]"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">{opt.name}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2 sm:justify-start pt-2 border-t border-slate-100">
            <Button
              variant="sovereign"
              size="sm"
              onClick={handleSaveEdit}
              className="rounded-2xl font-bold text-xs h-10 px-5"
            >
              حفظ التعديلات
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditCategory(null)}
              className="rounded-2xl text-xs h-10 px-4"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Subcategory Dialog */}
      <Dialog open={!!subParent} onOpenChange={() => setSubParent(null)}>
        <DialogContent className="max-w-md rounded-3xl p-6 sm:p-8 font-sans">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-[#006948]" />
              إضافة تصنيف فرعي تحت &quot;{subParent?.nameAr}&quot;
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 my-2 text-xs">
            <label className="text-xs font-bold text-slate-700 block">اسم التصنيف الفرعي:</label>
            <Input
              value={subNameAr}
              onChange={(e) => setSubNameAr(e.target.value)}
              placeholder="مثال: سماعات الرأس اللاسلكية ANC"
              className="rounded-2xl text-xs h-10"
            />
          </div>

          <DialogFooter className="flex gap-2 sm:justify-start pt-2 border-t border-slate-100">
            <Button
              variant="sovereign"
              size="sm"
              onClick={handleAddSubcategory}
              className="rounded-2xl font-bold text-xs h-10 px-5"
            >
              إضافة وحفظ
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSubParent(null)}
              className="rounded-2xl text-xs h-10 px-4"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
