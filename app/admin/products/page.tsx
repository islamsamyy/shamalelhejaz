"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CheckSquare,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  ShieldCheck,
  Building,
  AlertTriangle,
  FileText,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { formatSAR } from "@/lib/utils";
import { toast } from "sonner";

interface AdminProductRow {
  id: string;
  sku: string;
  title: string;
  category: string;
  categorySlug: string;
  vendor: string;
  vendorId: string | null;
  price: number;
  stockQty: number;
  submittedAt: string;
  certificateType: string;
  status: "pending" | "approved" | "rejected";
  image: string;
  rejectionReason?: string;
}

export default function CatalogModerationPage() {
  const [products, setProducts] = useState<AdminProductRow[]>([]);
  const [categories, setCategories] = useState<{ id: string; title: string; slug: string }[]>([]);
  const [vendors, setVendors] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"approved" | "pending" | "rejected">("approved");
  const [search, setSearch] = useState("");

  // Modals state
  const [previewItem, setPreviewItem] = useState<AdminProductRow | null>(null);
  const [rejectingItem, setRejectingItem] = useState<AdminProductRow | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState("");

  // Add Product modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: "",
    price: 1500,
    stockQty: 10,
    categorySlug: "",
    vendorId: "",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
    description: "",
    certificateType: "مطابقة هيئة المواصفات والمقاييس SASO",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, venRes] = await Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        supabase.from("categories").select("id, title, slug").order("title", { ascending: true }),
        supabase.from("vendors").select("id, name").order("name", { ascending: true }),
      ]);

      if (catRes.data) {
        setCategories(catRes.data);
        if (!newProduct.categorySlug && catRes.data[0]) {
          setNewProduct((prev) => ({ ...prev, categorySlug: catRes.data![0].slug }));
        }
      }
      if (venRes.data) {
        setVendors(venRes.data);
        if (!newProduct.vendorId && venRes.data[0]) {
          setNewProduct((prev) => ({ ...prev, vendorId: venRes.data![0].id }));
        }
      }

      if (prodRes.data) {
        const mapped: AdminProductRow[] = prodRes.data.map((p: any) => ({
          id: p.id,
          sku: p.sku || `SQ-${String(p.id).slice(0, 6).toUpperCase()}`,
          title: p.title,
          category: p.category,
          categorySlug: p.category_slug,
          vendor: p.vendor || "سوق السعودية",
          vendorId: p.vendor_id,
          price: Number(p.price),
          stockQty: Number(p.stock_qty ?? 0),
          submittedAt: p.created_at ? new Date(p.created_at).toLocaleDateString("ar-SA") : "الآن",
          certificateType: p.certificate_type || "مطابقة هيئة المواصفات والمقاييس SASO",
          status:
            p.moderation_status === "pending" || p.moderation_status === "rejected"
              ? p.moderation_status
              : p.is_active === false
              ? "rejected"
              : "approved",
          image: p.image,
          rejectionReason: p.rejection_reason || undefined,
        }));
        setProducts(mapped);
      }
    } finally {
      setLoading(false);
    }
  }, [newProduct.categorySlug, newProduct.vendorId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = products.filter((p) => {
    const matchesTab = p.status === activeTab;
    const matchesSearch =
      p.title.includes(search) ||
      p.vendor.includes(search) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleApprove = async (id: string, title: string) => {
    const { error } = await supabase
      .from("products")
      .update({ moderation_status: "approved", is_active: true, rejection_reason: null })
      .eq("id", id);

    if (error) {
      toast.error(`تعذر اعتماد المنتج: ${error.message}`);
      return;
    }
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "approved" } : item))
    );
    toast.success(`تم اعتماد "${title}" ونشره فورياً في الكتالوج!`);
  };

  const handleConfirmReject = async () => {
    if (!rejectingItem) return;
    if (!rejectionNotes.trim()) {
      toast.error("يرجى تدوين سبب الرفض لتوجيه التاجر بتصحيح الملف");
      return;
    }
    const { error } = await supabase
      .from("products")
      .update({
        moderation_status: "rejected",
        is_active: false,
        rejection_reason: rejectionNotes.trim(),
      })
      .eq("id", rejectingItem.id);

    if (error) {
      toast.error(`تعذر رفض المنتج: ${error.message}`);
      return;
    }

    setProducts((prev) =>
      prev.map((item) =>
        item.id === rejectingItem.id
          ? { ...item, status: "rejected", rejectionReason: rejectionNotes.trim() }
          : item
      )
    );
    toast.error(`تم رفض "${rejectingItem.title}" وحفظ السبب في قاعدة البيانات.`);
    setRejectingItem(null);
  };

  const handleDeleteProduct = async (id: string, title: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast.error(`تعذر حذف المنتج: ${error.message}`);
      return;
    }
    setProducts((prev) => prev.filter((item) => item.id !== id));
    toast.success(`تم حذف "${title}" من قاعدة البيانات.`);
  };

  const handleCreateProduct = async () => {
    if (!newProduct.title.trim()) {
      toast.error("يرجى إدخال اسم المنتج");
      return;
    }
    const cat = categories.find((c) => c.slug === newProduct.categorySlug) || categories[0];
    const ven = vendors.find((v) => v.id === newProduct.vendorId) || vendors[0];
    const id = `prd-${Date.now()}`;
    const sku = `SQ-${String(Date.now()).slice(-6)}`;

    const { error } = await supabase.from("products").insert([
      {
        id,
        sku,
        title: newProduct.title.trim(),
        price: Number(newProduct.price),
        stock_qty: Number(newProduct.stockQty),
        stock_status: Number(newProduct.stockQty) > 0 ? "in_stock" : "out_of_stock",
        image: newProduct.image.trim(),
        images: [newProduct.image.trim()],
        category: cat?.title || "عام",
        category_slug: cat?.slug || "general",
        vendor: ven?.name || "شمال الحجاز",
        vendor_id: ven?.id || null,
        vendor_verified: true,
        description: newProduct.description.trim(),
        certificate_type: newProduct.certificateType.trim(),
        moderation_status: "approved",
        is_active: true,
      },
    ]);

    if (error) {
      toast.error(`تعذر إضافة المنتج: ${error.message}`);
      return;
    }

    toast.success(`تمت إضافة "${newProduct.title}" وحفظه في قاعدة البيانات!`);
    setIsAddOpen(false);
    setNewProduct((prev) => ({ ...prev, title: "", description: "" }));
    setActiveTab("approved");
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <CheckSquare className="w-7 h-7 text-[#006948]" />
            إدارة وتدقيق منتجات الكتالوج
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            إضافة واعتماد المنتجات مباشرة في قاعدة بيانات Supabase مع تطبيق سياسات RLS.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="sovereign"
            size="sm"
            onClick={() => setIsAddOpen(true)}
            className="rounded-xl font-bold text-xs"
          >
            <PlusCircle className="w-4 h-4 ml-1.5" />
            إضافة منتج جديد للكتالوج
          </Button>
        </div>
      </div>

      {/* Tabs & Search Controls */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث باسم المقتنى، التاجر، أو رمز SKU..."
              className="pr-10 rounded-2xl border-slate-200 text-xs h-10 w-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {[
            { id: "approved", label: "معتمد ومنشور", count: products.filter((p) => p.status === "approved").length },
            { id: "pending", label: "بانتظار التدقيق", count: products.filter((p) => p.status === "pending").length },
            { id: "rejected", label: "مرفوض ومخفي", count: products.filter((p) => p.status === "rejected").length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Moderation Queue Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">المقتنى والتصنيف</th>
                <th className="p-4">التاجر والمنشأة</th>
                <th className="p-4">السعر والمخزون</th>
                <th className="p-4">شهادة الأصالة والاعتماد</th>
                <th className="p-4">تاريخ الإدراج</th>
                <th className="p-4 text-center">قرار المشرف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block line-clamp-1 max-w-[280px]">
                          {item.title}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-slate-500">{item.category}</span>
                          <span className="text-[10px] font-mono text-slate-400">SKU: {item.sku}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <div>
                        <span className="font-bold text-slate-800 block">{item.vendor}</span>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="font-black text-slate-900 block">{formatSAR(item.price)}</span>
                    <span className="text-[10px] text-emerald-700 font-semibold">
                      المخزون: {item.stockQty} قطعة
                    </span>
                  </td>

                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="line-clamp-1 max-w-[180px]">{item.certificateType}</span>
                    </span>
                  </td>

                  <td className="p-4 text-slate-500 font-medium">{item.submittedAt}</td>

                  <td className="p-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewItem(item)}
                        className="h-8 px-2.5 rounded-xl border-slate-200 text-slate-700 text-xs"
                      >
                        <Eye className="w-3.5 h-3.5 ml-1 text-slate-500" />
                        معاينة
                      </Button>

                      {item.status !== "approved" && (
                        <Button
                          variant="sovereign"
                          size="sm"
                          onClick={() => handleApprove(item.id, item.title)}
                          className="h-8 px-3 rounded-xl font-bold text-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 ml-1" />
                          اعتماد
                        </Button>
                      )}

                      {item.status !== "rejected" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setRejectingItem(item);
                            setRejectionNotes("");
                          }}
                          className="h-8 px-3 rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold"
                        >
                          <XCircle className="w-3.5 h-3.5 ml-1" />
                          إخفاء/رفض
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteProduct(item.id, item.title)}
                        className="h-8 px-2.5 rounded-xl border-slate-200 text-rose-600 hover:bg-rose-50 text-xs"
                        title="حذف نهائي"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    لا توجد منتجات في هذه القائمة حالياً. يمكنك إضافة منتج جديد من الزر أعلاه.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-lg rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-[#006948]" />
              إضافة منتج جديد إلى قاعدة البيانات
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 my-2 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">اسم المنتج:</label>
              <Input
                value={newProduct.title}
                onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                placeholder="مثال: ساعة الكرونوغراف الملكية إصدار طويق"
                className="rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">السعر (ر.س):</label>
                <Input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                  className="rounded-xl text-xs font-mono"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">الكمية المتوفرة:</label>
                <Input
                  type="number"
                  value={newProduct.stockQty}
                  onChange={(e) => setNewProduct({ ...newProduct, stockQty: Number(e.target.value) })}
                  className="rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">القسم:</label>
                <select
                  value={newProduct.categorySlug}
                  onChange={(e) => setNewProduct({ ...newProduct, categorySlug: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">المتجر / التاجر:</label>
                <select
                  value={newProduct.vendorId}
                  onChange={(e) => setNewProduct({ ...newProduct, vendorId: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold"
                >
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">رابط الصورة:</label>
              <Input
                value={newProduct.image}
                onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                dir="ltr"
                className="rounded-xl text-xs font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">وصف المنتج:</label>
              <Textarea
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                placeholder="وصف تفصيلي للمنتج والمواصفات..."
                className="rounded-xl text-xs min-h-[70px]"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2 sm:justify-start">
            <Button
              variant="sovereign"
              size="sm"
              onClick={handleCreateProduct}
              className="rounded-xl font-bold text-xs"
            >
              حفظ ونشر في المتجر
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

      {/* Full Preview Modal */}
      <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
        <DialogContent className="max-w-xl rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#006948]" />
              ملف فحص وتدقيق المقتنى السيادي
            </DialogTitle>
          </DialogHeader>

          {previewItem && (
            <div className="space-y-4 my-2 text-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewItem.image}
                alt={previewItem.title}
                className="w-full h-52 object-cover rounded-2xl border border-slate-200"
              />

              <div className="space-y-2">
                <h4 className="font-bold text-sm text-slate-900">{previewItem.title}</h4>
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">المنشأة والتاجر:</span>
                    <span className="font-bold text-slate-800">{previewItem.vendor}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">السعر المحدد:</span>
                    <span className="font-black text-[#006948] text-sm">{formatSAR(previewItem.price)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">المخزون الفعلي:</span>
                    <span className="font-mono text-slate-700">{previewItem.stockQty}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">شهادة الاعتماد:</span>
                    <span className="font-medium text-emerald-800">{previewItem.certificateType}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:justify-start">
            {previewItem?.status !== "approved" && (
              <Button
                variant="sovereign"
                size="sm"
                onClick={() => {
                  if (previewItem) handleApprove(previewItem.id, previewItem.title);
                  setPreviewItem(null);
                }}
                className="rounded-xl font-bold text-xs"
              >
                اعتماد ونشر فوراً
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewItem(null)}
              className="rounded-xl text-xs"
            >
              إغلاق المعاينة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Reason Modal */}
      <Dialog open={!!rejectingItem} onOpenChange={() => setRejectingItem(null)}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              ملاحظات رفض أو إخفاء المقتنى
            </DialogTitle>
          </DialogHeader>

          {rejectingItem && (
            <div className="space-y-3 my-2 text-xs">
              <p className="text-slate-600">
                يرجى كتابة سبب عدم اعتماد المقتنى ليتم حفظه في قاعدة البيانات وإشعار التاجر:
              </p>
              <Textarea
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
                placeholder="أدخل ملاحظات التدقيق والاشتراطات الناقصة..."
                className="rounded-xl border-slate-200 text-xs min-h-[90px]"
              />
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:justify-start">
            <Button
              variant="outline"
              size="sm"
              onClick={handleConfirmReject}
              className="rounded-xl bg-rose-600 text-white hover:bg-rose-700 font-bold text-xs"
            >
              تأكيد الرفض والحفظ
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRejectingItem(null)}
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
