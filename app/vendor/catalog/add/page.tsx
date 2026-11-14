"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import VendorNav from "@/components/vendor/VendorNav";
import StorefrontFooter from "@/components/StorefrontFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  PackagePlus,
  Upload,
  CheckCircle2,
  ChevronLeft,
  Sparkles,
  ArrowLeft,
  Layers,
} from "lucide-react";
import { formatSAR } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function AddProductStudioPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<number>(1200);
  const [category, setCategory] = useState("الإلكترونيات والأجهزة الذكية");
  const [region, setRegion] = useState("الرياض • المملكة العربية السعودية");
  const [stock, setStock] = useState(15);
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const vat15 = Math.round(price * 0.15);
  const totalCustomerPrice = price + vat15;
  const netVendorPayout = Math.round(price * 0.92);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("يرجى إدخال مسمى المنتج.");
      return;
    }
    setIsSubmitting(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

      let vendorId = "modern-tech";
      let vendorName = "شركة آفاق التقنية للتجارة";

      if (user) {
        const { data: v } = await supabase
          .from("vendors")
          .select("id, name")
          .eq("owner_id", user.id)
          .maybeSingle();
        if (v) {
          vendorId = v.id;
          vendorName = v.name;
        }
      }

      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
        .slice(0, 40);
      const newId = `prod-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      const sku = `SQ-${Date.now().toString().slice(-6)}`;

      const { error } = await supabase.from("products").insert([
        {
          id: newId,
          sku,
          title: title.trim(),
          price: Number(price),
          image: imageUrl.trim() || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
          images: [imageUrl.trim() || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"],
          vendor: vendorName,
          vendor_id: vendorId,
          category,
          category_slug: category === "الإلكترونيات والأجهزة الذكية" ? "electronics" : "all",
          stock_qty: Number(stock),
          stock_status: Number(stock) > 2 ? "in_stock" : "low_stock",
          description: description.trim(),
          moderation_status: "pending",
          is_active: false,
          rating: 5.0,
          reviews: 0,
          sales_count: "جديد",
          badge: "قيد تدقيق الإدارة",
          delivery: "express",
          delivery_label: "شحن سريع خلال ٢٤ ساعة",
        },
      ]);

      if (error) {
        toast.error("فشل حفظ المنتج: " + error.message);
        return;
      }

      toast.success(`تم إرسال القطعة "${title}" للاعتماد في الكتالوج وحفظها في Supabase!`);
      router.push("/vendor/catalog");
    } catch (err: any) {
      toast.error("حدث خطأ أثناء الحفظ: " + (err?.message || ""));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col">
      <VendorNav />

      <main className="flex-1">
        <section className="bg-white border-b border-slate-200/80 py-8">
          <div className="max-w-[1000px] mx-auto px-4 lg:px-8">
            <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2">
              <Link href="/vendor" className="hover:text-[#006948] transition-colors">بوابة التجار</Link>
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="text-[#006948] font-bold">استوديو إضافة مقتنى جديد للكتالوج</span>
            </nav>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#006948] flex items-center justify-center">
                <PackagePlus className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900">
                  استوديو الكتالوج وإضافة مقتنى ملكي
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  إدراج المنتجات الحرفية والنوادر مع احتساب الضريبة ZATCA Phase-2 آلياً.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-[1000px] mx-auto px-4 lg:px-8 py-8">
          <form onSubmit={handleSaveProduct} className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-md space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  مسمى القطعة الكامل
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: دهن عود تراد معتق ٣٠ عاماً بختم الشمع الملكي"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">القسم السيادي</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#006948]"
                >
                  <option value="أطياب ملكية">أطياب ملكية وعود وبخور</option>
                  <option value="ساعات ومجوهرات">ساعات ومجوهرات ملكية</option>
                  <option value="أزياء تراثية">بشوت ومنسوجات حساوية</option>
                  <option value="عتاد الصقارة">عتاد الصقارة والخيل</option>
                  <option value="حرف وفنون">حِرف وفنون سعودية</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">المنطقة الجغرافية / الحرفة</label>
                <Input
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="الرياض / الأحساء / الطائف..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  السعر الأساسي بدون الضريبة (ر.س)
                </label>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  min={100}
                  step={100}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">الكمية المتوفرة بالمستودع</label>
                <Input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  min={1}
                  required
                />
              </div>
            </div>

            {/* Live Pricing Breakdown Card */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-2 text-xs">
              <span className="font-bold text-emerald-800 block">احتساب ضريبة ZATCA وصافي الأرباح التلقائي:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-slate-700">
                <div>
                  <span className="text-slate-500 block">ضريبة 15% ZATCA:</span>
                  <span className="font-bold text-slate-900">{formatSAR(vat15)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">سعر العرض للعميل:</span>
                  <span className="font-black text-[#006948]">{formatSAR(totalCustomerPrice)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">صافي أرباح التاجر (92%):</span>
                  <span className="font-black text-emerald-700">{formatSAR(netVendorPayout)}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                الوصف الفني وقصة القطعة التراثية
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="تفاصيل التعتيق، طريقة الحياكة، عيار الذهب، أو شهادات الفحص..."
                className="h-28"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => router.push("/vendor")}>
                إلغاء
              </Button>
              <Button type="submit" variant="sovereign" size="lg" className="font-bold">
                حفظ وإرسال للاعتماد السيادي
              </Button>
            </div>
          </form>
        </section>
      </main>

      <StorefrontFooter />
    </div>
  );
}
