"use client";

import React, { useState, useEffect, useCallback } from "react";
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

export default function TaxonomyBuilderPage() {
  const [categories, setCategories] = useState<ParentCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Category Dialog
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newNameAr, setNewNameAr] = useState("");
  const [newNameEn, setNewNameEn] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newCommission, setNewCommission] = useState(8);
  const [newIcon, setNewIcon] = useState("✨");

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
        console.warn("Could not load categories:", error.message);
        return;
      }

      const mapped: ParentCategory[] = (data || []).map((row: any) => {
        const rawSubs = Array.isArray(row.subcategories) ? row.subcategories : [];
        return {
          id: row.id,
          nameAr: row.title,
          nameEn: row.name_en || row.subtitle || row.slug,
          slug: row.slug,
          commission: Number(row.commission ?? 8),
          vatRate: Number(row.vat_rate ?? 15),
          icon: row.icon_name || "📦",
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
        icon_name: newIcon || "✨",
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

    toast.success(`تم إنشاء القسم الرئيسي "${newNameAr}" وحفظه في قاعدة البيانات!`);
    setIsAddOpen(false);
    setNewNameAr("");
    setNewNameEn("");
    setNewSlug("");
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
    toast.info(`تم تحديث حالة عرض القسم "${cat.nameAr}" في قاعدة البيانات.`);
  };

  const handleDeleteCategory = async (cat: ParentCategory) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <FolderTree className="w-7 h-7 text-[#006948]" />
            هندسة وبناء هيكل الأقسام (Taxonomy Builder)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            إدارة شجرة الأقسام الرئيسية والفرعية في قاعدة بيانات Supabase مباشرة ({categories.length} قسم).
          </p>
        </div>

        <Button
          variant="sovereign"
          size="sm"
          onClick={() => setIsAddOpen(true)}
          className="rounded-xl font-bold text-xs"
        >
          <PlusCircle className="w-4 h-4 ml-1.5" />
          إضافة قسم رئيسي جديد
        </Button>
      </div>

      {/* Category Tree Cards */}
      <div className="space-y-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 transition-all hover:border-emerald-300"
          >
            {/* Category Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-sm font-bold text-[#006948] shrink-0 shadow-xs">
                  {cat.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-slate-900 text-base">{cat.nameAr}</h3>
                    <Badge variant={cat.active ? "sovereign" : "outline"} className="text-[10px]">
                      {cat.active ? "نشط بالمتجر" : "مخفي مؤقتاً"}
                    </Badge>
                  </div>
                  <span className="text-xs text-slate-500 font-mono block mt-0.5">
                    {cat.nameEn} • slug: /{cat.slug}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-bold">
                <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
                  عمولة القسم: <span className="font-mono text-[#006948] font-black">{cat.commission}%</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
                  ضريبة زاتكا: <span className="font-mono text-emerald-800 font-black">{cat.vatRate}%</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleActive(cat)}
                  className="rounded-xl text-xs h-8"
                >
                  {cat.active ? "إخفاء" : "تفعيل"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteCategory(cat)}
                  className="rounded-xl text-xs h-8 text-rose-600 border-slate-200 hover:bg-rose-50"
                  title="حذف القسم"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Sub-categories Badges Matrix */}
            <div>
              <span className="text-xs font-bold text-slate-600 block mb-2">
                الأقسام والتصنيفات الفرعية ({cat.subcategories.length}):
              </span>
              <div className="flex flex-wrap gap-2">
                {cat.subcategories.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                  >
                    <span className="font-bold text-slate-800">{sub.nameAr}</span>
                  </div>
                ))}
                <button
                  onClick={() => {
                    setSubParent(cat);
                    setSubNameAr("");
                  }}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl border border-dashed border-slate-300 text-slate-500 hover:text-[#006948] hover:border-emerald-400 text-xs font-bold transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>تصنيف فرعي</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {!loading && categories.length === 0 && (
          <div className="text-center py-12 text-slate-400 bg-white rounded-3xl border border-slate-200">
            لا توجد أقسام مسجلة حالياً.
          </div>
        )}
      </div>

      {/* Add Category Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-[#006948]" />
              إضافة قسم تصنيفي رئيسي جديد
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 my-2 text-xs">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">اسم القسم بالعربية:</label>
              <Input
                value={newNameAr}
                onChange={(e) => setNewNameAr(e.target.value)}
                placeholder="مثال: الخيول ولوازم الفروسية"
                className="rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                اسم القسم بالإنجليزية (English Name):
              </label>
              <Input
                value={newNameEn}
                onChange={(e) => setNewNameEn(e.target.value)}
                placeholder="e.g. Equestrian & Arabian Horses"
                className="rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">معرف الرابط (Slug):</label>
              <Input
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                placeholder="equestrian-horses"
                dir="ltr"
                className="rounded-xl text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">نسبة عمولة المنصة (%):</label>
                <Input
                  type="number"
                  value={newCommission}
                  onChange={(e) => setNewCommission(Number(e.target.value))}
                  className="rounded-xl text-xs font-bold font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">الأيقونة التعبيرية:</label>
                <Input
                  value={newIcon}
                  onChange={(e) => setNewIcon(e.target.value)}
                  className="rounded-xl text-xs text-center"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2 sm:justify-start">
            <Button
              variant="sovereign"
              size="sm"
              onClick={handleAddCategory}
              className="rounded-xl font-bold text-xs"
            >
              حفظ ونشر القسم
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddOpen(false)}
              className="rounded-xl text-xs"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Subcategory Dialog */}
      <Dialog open={!!subParent} onOpenChange={() => setSubParent(null)}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-[#006948]" />
              إضافة تصنيف فرعي تحت {subParent?.nameAr}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 my-2 text-xs">
            <label className="text-xs font-bold text-slate-700 block">اسم التصنيف الفرعي:</label>
            <Input
              value={subNameAr}
              onChange={(e) => setSubNameAr(e.target.value)}
              placeholder="مثال: ساعات الكرونوغراف السويسرية"
              className="rounded-xl text-xs"
            />
          </div>

          <DialogFooter className="flex gap-2 sm:justify-start">
            <Button
              variant="sovereign"
              size="sm"
              onClick={handleAddSubcategory}
              className="rounded-xl font-bold text-xs"
            >
              إضافة وحفظ
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSubParent(null)}
              className="rounded-xl text-xs"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
