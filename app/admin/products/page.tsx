"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { fetchProductsFromSupabase } from "@/lib/supabase";
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
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  ShieldCheck,
  Building,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { formatSAR } from "@/lib/utils";
import { toast } from "sonner";

interface PendingProduct {
  id: string;
  sku: string;
  title: string;
  category: string;
  vendor: string;
  vendorCr: string;
  price: number;
  submittedAt: string;
  certificateType: string;
  status: "pending" | "approved" | "rejected";
  image: string;
  rejectionReason?: string;
}

const mockProducts: PendingProduct[] = [
  {
    id: "MOD-819",
    sku: "SQ-MOD-01",
    title: "خنجر نجراني مذهب بنقش الصقر الملكي وحزام حرير طبيعي",
    category: "التحف والمقتنيات التراثية",
    vendor: "صاغة الجنوب التراثية",
    vendorCr: "5900018291",
    price: 18500,
    submittedAt: "اليوم، 11:20 ص",
    certificateType: "شهادة مطابقة المعادن الثمينة - مختبر معتمد",
    status: "pending",
    image: "https://images.unsplash.com/photo-1589782182703-2aaa69037b5b?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "MOD-820",
    sku: "SQ-MOD-02",
    title: "تولة دهن عود تراد حطب قديم غابات تايلاند معتق 25 سنة",
    category: "دهن العود والبخور الفاخر",
    vendor: "بيت العود المعتق",
    vendorCr: "1010394821",
    price: 7400,
    submittedAt: "اليوم، 10:05 ص",
    certificateType: "فحص نقاء وخلو من الإضافات الكيميائية (SASO)",
    status: "pending",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "MOD-821",
    sku: "SQ-MOD-03",
    title: "بشت ملكي وبر إبل وبار نخب أول دقة ملكية زري ألماني 24K",
    category: "البشوت والمشالح الملكية",
    vendor: "مشالح الأحساء التاريخية",
    vendorCr: "2251029481",
    price: 26000,
    submittedAt: "أمس، 04:40 م",
    certificateType: "وثيقة حِرفة يدوية وطنية موثقة من هيئة التراث",
    status: "pending",
    image: "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "MOD-822",
    sku: "SQ-MOD-04",
    title: "ساعة الكرونوغراف KSA-02 مصفوفة التيتانيوم إصدار طويق",
    category: "الساعات والكرونوغراف",
    vendor: "دار الصائغ الملكية",
    vendorCr: "1010482910",
    price: 54000,
    submittedAt: "أمس، 02:15 م",
    certificateType: "شهادة المنشأ السويسرية والضمان السيادي",
    status: "pending",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "MOD-823",
    sku: "SQ-MOD-05",
    title: "قلادة الذهب النجدي المرصعة باللؤلؤ الحر الخليجي الطبيعي",
    category: "المجوهرات والحلي الملكية",
    vendor: "مجوهرات اليمامة التراثية",
    vendorCr: "1010294822",
    price: 42000,
    submittedAt: "أمس، 11:00 ص",
    certificateType: "تقرير فحص اللؤلؤ الطبيعي (مختبر الأحجار الكريمة)",
    status: "pending",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80",
  },
];

export default function CatalogModerationPage() {
  const [products, setProducts] = useState<PendingProduct[]>(mockProducts);
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [search, setSearch] = useState("");
  
  // Modals state
  const [previewItem, setPreviewItem] = useState<PendingProduct | null>(null);
  const [rejectingItem, setRejectingItem] = useState<PendingProduct | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState("");

  useEffect(() => {
    async function loadDbProducts() {
      try {
        const dbProducts = await fetchProductsFromSupabase();
        if (dbProducts && dbProducts.length > 0) {
          const mapped: PendingProduct[] = dbProducts.map((p) => ({
            id: p.id,
            sku: `SQ-${p.id.slice(0, 6).toUpperCase()}`,
            title: p.title,
            category: p.category,
            vendor: p.vendor || "سوق السعودية",
            vendorCr: "1010829102",
            price: p.price,
            submittedAt: "مؤخراً",
            certificateType: "مطابقة هيئة المواصفات والمقاييس SASO",
            status: "approved",
            image: p.image,
          }));
          setProducts([...mockProducts, ...mapped]);
        }
      } catch (e) {
        console.warn("Could not load dynamic products:", e);
      }
    }
    loadDbProducts();
  }, []);

  const filtered = products.filter((p) => {
    const matchesTab = p.status === activeTab;
    const matchesSearch =
      p.title.includes(search) || p.vendor.includes(search) || p.sku.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleApprove = (id: string, title: string) => {
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "approved" } : item))
    );
    toast.success(`تم اعتماد "${title}" ونشره فورياً في الكتالوج المعتمد ZATCA Phase-2!`);
  };

  const handleOpenReject = (item: PendingProduct) => {
    setRejectingItem(item);
    setRejectionNotes("");
  };

  const handleConfirmReject = () => {
    if (!rejectingItem) return;
    if (!rejectionNotes.trim()) {
      toast.error("يرجى تدوين سبب الرفض لتوجيه التاجر بتصحيح الملف");
      return;
    }
    setProducts((prev) =>
      prev.map((item) =>
        item.id === rejectingItem.id
          ? { ...item, status: "rejected", rejectionReason: rejectionNotes }
          : item
      )
    );
    toast.error(`تم رفض "${rejectingItem.title}" وإشعار التاجر بملاحظات التدقيق.`);
    setRejectingItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <CheckSquare className="w-7 h-7 text-[#006948]" />
            طابور تدقيق واعتماد منتجات الكتالوج
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            فحص الجودة والتأكد من شهادات الأصالة وامتثال التسعير لضريبة القيمة المضافة 15% قبل النشر في المتجر الوطني.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 font-mono text-xs">
            <ShieldCheck className="w-3.5 h-3.5 ml-1 text-emerald-600" />
            معايير الأصالة: نشطة
          </Badge>
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
              placeholder="ابحث باسم المقتنى، التاجر، أو السجل..."
              className="pr-10 rounded-2xl border-slate-200 text-xs h-10 w-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {[
            { id: "pending", label: "بانتظار التدقيق", count: products.filter((p) => p.status === "pending").length },
            { id: "approved", label: "معتمد ومنشور", count: products.filter((p) => p.status === "approved").length },
            { id: "rejected", label: "مرفوض ومُعاد", count: products.filter((p) => p.status === "rejected").length },
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
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
              }`}>
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
                <th className="p-4">السعر شامل الضريبة</th>
                <th className="p-4">شهادة الأصالة والاعتماد</th>
                <th className="p-4">وقت التقديم</th>
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
                        <span className="text-[10px] text-slate-400 font-mono">س.ت: {item.vendorCr}</span>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="font-black text-slate-900 block">{formatSAR(item.price)}</span>
                    <span className="text-[10px] text-emerald-700 font-semibold">ضريبة زاتكا 15% متضمنة</span>
                  </td>

                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="line-clamp-1 max-w-[180px]">{item.certificateType}</span>
                    </span>
                  </td>

                  <td className="p-4 text-slate-500 font-medium">
                    {item.submittedAt}
                  </td>

                  <td className="p-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewItem(item)}
                        title="معاينة الملف الكامل"
                        className="h-8 px-2.5 rounded-xl border-slate-200 text-slate-700 text-xs"
                      >
                        <Eye className="w-3.5 h-3.5 ml-1 text-slate-500" />
                        معاينة
                      </Button>

                      {item.status === "pending" && (
                        <>
                          <Button
                            variant="sovereign"
                            size="sm"
                            onClick={() => handleApprove(item.id, item.title)}
                            className="h-8 px-3 rounded-xl font-bold text-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 ml-1" />
                            اعتماد
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenReject(item)}
                            className="h-8 px-3 rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold"
                          >
                            <XCircle className="w-3.5 h-3.5 ml-1" />
                            رفض
                          </Button>
                        </>
                      )}

                      {item.status === "approved" && (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300">
                          معتمد ومنشور
                        </Badge>
                      )}

                      {item.status === "rejected" && (
                        <Badge variant="outline" className="bg-rose-50 text-rose-800 border-rose-300">
                          مرفوض
                        </Badge>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    لا توجد منتجات في هذه القائمة حالياً.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                    <span className="text-slate-400 block text-[10px]">السجل التجاري:</span>
                    <span className="font-mono text-slate-700">{previewItem.vendorCr}</span>
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
            {previewItem?.status === "pending" && (
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
              ملاحظات رفض إدراج المقتنى
            </DialogTitle>
          </DialogHeader>

          {rejectingItem && (
            <div className="space-y-3 my-2 text-xs">
              <p className="text-slate-600">
                يرجى كتابة سبب عدم اعتماد المقتنى بدقة (مثل: نقص وثيقة العيار، جودة الصور، أو خطأ في احتساب ضريبة زاتكا) ليتم إشعار التاجر:
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
              تأكيد الرفض وإشعار المنشأة
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

