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
  Tag,
  PlusCircle,
  Clock,
  Copy,
  CheckCircle2,
  Flame,
  Trash2,
} from "lucide-react";
import { formatSAR } from "@/lib/utils";
import { toast } from "sonner";

interface PromoCoupon {
  id: string;
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrder: number;
  usages: number;
  maxUsages: number;
  expiryDate: string;
  active: boolean;
}

export default function MarketingEnginePage() {
  const [coupons, setCoupons] = useState<PromoCoupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [isAddCouponOpen, setIsAddCouponOpen] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDiscountType, setNewDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [newDiscount, setNewDiscount] = useState(10);
  const [newMinOrder, setNewMinOrder] = useState(200);
  const [newMaxUsages, setNewMaxUsages] = useState(1000);

  // Flash Sale state persisted in app_settings('flash_sale')
  const [flashSaleActive, setFlashSaleActive] = useState(true);
  const [flashSaleTitle, setFlashSaleTitle] = useState("خزائن صقور الجزيرة • إصدارات محدودة");
  const [flashSaleEnd, setFlashSaleEnd] = useState("٢٤ ساعة و ٠٤ دقائق متبقية");

  const loadMarketing = useCallback(async () => {
    setLoading(true);
    try {
      const [cpRes, fsRes] = await Promise.all([
        supabase.from("coupons").select("*").order("created_at", { ascending: false }),
        supabase.from("app_settings").select("value").eq("key", "flash_sale").maybeSingle(),
      ]);

      if (cpRes.data) {
        setCoupons(
          cpRes.data.map((c: any) => ({
            id: c.id,
            code: c.code,
            description: c.description || "كوبون خصم معتمد",
            discountType: c.discount_type === "fixed" ? "fixed" : "percentage",
            discountValue: Number(c.discount_value || 0),
            minOrder: Number(c.min_order_amount || 0),
            usages: Number(c.used_count || 0),
            maxUsages: Number(c.usage_limit || 1000),
            expiryDate: c.expires_at
              ? new Date(c.expires_at).toLocaleDateString("ar-SA")
              : "مفتوح الصلاحية",
            active: c.is_active !== false,
          }))
        );
      }

      if (fsRes.data?.value && typeof fsRes.data.value === "object") {
        const val = fsRes.data.value as any;
        setFlashSaleActive(val.active !== false);
        if (val.title) setFlashSaleTitle(val.title);
        if (val.end_label) setFlashSaleEnd(val.end_label);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMarketing();
  }, [loadMarketing]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`تم نسخ الكوبون "${code}" إلى الحافظة!`);
  };

  const handleToggleCoupon = async (coupon: PromoCoupon) => {
    const nextActive = !coupon.active;
    const { error } = await supabase
      .from("coupons")
      .update({ is_active: nextActive })
      .eq("id", coupon.id);

    if (error) {
      toast.error(`تعذر تحديث الكوبون: ${error.message}`);
      return;
    }

    setCoupons((prev) =>
      prev.map((c) => (c.id === coupon.id ? { ...c, active: nextActive } : c))
    );
    toast.info(`تم تحديث حالة تفعيل الكوبون "${coupon.code}" في قاعدة البيانات.`);
  };

  const handleDeleteCoupon = async (coupon: PromoCoupon) => {
    const { error } = await supabase.from("coupons").delete().eq("id", coupon.id);
    if (error) {
      toast.error(`تعذر حذف الكوبون: ${error.message}`);
      return;
    }
    setCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
    toast.success(`تم حذف الكوبون "${coupon.code}".`);
  };

  const handleCreateCoupon = async () => {
    if (!newCode.trim()) {
      toast.error("يرجى إدخال رمز الكوبون");
      return;
    }
    const cleanCode = newCode.toUpperCase().trim();

    const { error } = await supabase.from("coupons").insert([
      {
        code: cleanCode,
        description: newDesc.trim() || "كوبون ترويجي معتمد",
        discount_type: newDiscountType,
        discount_value: Number(newDiscount),
        min_order_amount: Number(newMinOrder),
        usage_limit: Number(newMaxUsages),
        used_count: 0,
        is_active: true,
      },
    ]);

    if (error) {
      toast.error(`تعذر إنشاء الكوبون: ${error.message}`);
      return;
    }

    toast.success(`تم إنشاء ونشر الكوبون "${cleanCode}" في قاعدة البيانات!`);
    setIsAddCouponOpen(false);
    setNewCode("");
    setNewDesc("");
    loadMarketing();
  };

  const handleToggleFlashSale = async () => {
    const nextActive = !flashSaleActive;
    const { error } = await supabase.from("app_settings").upsert({
      key: "flash_sale",
      value: { active: nextActive, title: flashSaleTitle, end_label: flashSaleEnd },
      updated_at: new Date().toISOString(),
    });

    if (error) {
      toast.error(`تعذر تحديث حالة الحملة: ${error.message}`);
      return;
    }
    setFlashSaleActive(nextActive);
    toast.info(nextActive ? "تم استئناف حملة الخزينة السريعة" : "تم إيقاف الحملة مؤقتاً");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Tag className="w-7 h-7 text-[#006948]" />
            محرك العروض والكوبونات والحملات الترويجية
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            إدارة كوبونات الخصم الفعالة في `public.coupons` والتي يتم التحقق منها تلقائياً عند الدفع (`create_order_secure`).
          </p>
        </div>

        <Button
          variant="sovereign"
          size="sm"
          onClick={() => setIsAddCouponOpen(true)}
          className="rounded-xl font-bold text-xs"
        >
          <PlusCircle className="w-4 h-4 ml-1.5" />
          توليد كود خصم جديد
        </Button>
      </div>

      {/* Flash Sale Scheduler Card */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-950 to-slate-950 text-white p-6 sm:p-8 rounded-3xl border border-amber-800/60 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px]">
              <Flame className="w-3 h-3 ml-1 fill-amber-400" />
              حملة الخزائن السريعة النشطة (Flash Sale)
            </Badge>
            <span className="text-[11px] font-mono text-emerald-400 font-bold">
              {flashSaleActive ? "مفعلة في الإعدادات" : "موقوفة مؤقتاً"}
            </span>
          </div>
          <h3 className="text-xl font-black text-white">{flashSaleTitle}</h3>
          <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>العداد التنازلي التلقائي: {flashSaleEnd}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleFlashSale}
            className="rounded-xl bg-slate-900/80 text-white border-slate-700 text-xs font-bold"
          >
            {flashSaleActive ? "إيقاف الحملة مؤقتاً" : "إعادة تفعيل"}
          </Button>
        </div>
      </div>

      {/* Active Coupons List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">
            كوبونات الخصم وقسائم الشراء المعتمدة (`public.coupons`)
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            تطبق مباشرة في شاشة الدفع السريع
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">كود الكوبون والوصف</th>
                <th className="p-4">قيمة الخصم</th>
                <th className="p-4">الحد الأدنى للطلب</th>
                <th className="p-4">معدل الاستخدام</th>
                <th className="p-4">تاريخ الانتهاء</th>
                <th className="p-4">حالة الكود</th>
                <th className="p-4 text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyCode(c.code)}
                        className="font-mono font-black text-sm text-[#006948] bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="انقر لنسخ الكوبون"
                      >
                        <span>{c.code}</span>
                        <Copy className="w-3 h-3 text-emerald-700" />
                      </button>
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-1">{c.description}</span>
                  </td>

                  <td className="p-4 font-bold text-slate-900">
                    {c.discountType === "percentage" ? (
                      <span className="font-mono text-emerald-700 font-black text-sm">{c.discountValue}% خصم</span>
                    ) : (
                      <span className="font-mono text-emerald-700 font-black text-sm">{formatSAR(c.discountValue)}</span>
                    )}
                  </td>

                  <td className="p-4 font-mono font-medium text-slate-700">{formatSAR(c.minOrder)}</td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">
                        {c.usages} / {c.maxUsages}
                      </span>
                    </div>
                    <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-[#006948] rounded-full"
                        style={{ width: `${Math.min((c.usages / Math.max(1, c.maxUsages)) * 100, 100)}%` }}
                      />
                    </div>
                  </td>

                  <td className="p-4 text-slate-500 font-medium">{c.expiryDate}</td>

                  <td className="p-4">
                    {c.active ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 ml-1 text-emerald-600" />
                        ساري ونشط
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-300">
                        معطل
                      </Badge>
                    )}
                  </td>

                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleCoupon(c)}
                        className="rounded-xl text-xs h-8"
                      >
                        {c.active ? "تعطيل" : "إعادة تفعيل"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCoupon(c)}
                        className="rounded-xl text-xs h-8 text-rose-600 border-slate-200 hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && coupons.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    لا توجد كوبونات خصم حالياً. اضغط على &quot;توليد كود خصم جديد&quot; لإضافة أول كوبون.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Coupon Modal */}
      <Dialog open={isAddCouponOpen} onOpenChange={setIsAddCouponOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-[#006948]" />
              إنشاء كود خصم سيادي جديد
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 my-2 text-xs">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">رمز الكوبون (Promo Code):</label>
              <Input
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="مثال: SOUQ2030"
                dir="ltr"
                className="rounded-xl font-mono uppercase text-xs font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">الوصف والمناسبة:</label>
              <Input
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="مثال: خصم احتفالية اليوم الوطني"
                className="rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">نوع الخصم:</label>
                <select
                  value={newDiscountType}
                  onChange={(e) => setNewDiscountType(e.target.value as "percentage" | "fixed")}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold"
                >
                  <option value="percentage">نسبة مئوية (%)</option>
                  <option value="fixed">مبلغ ثابت (ر.س)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">قيمة الخصم:</label>
                <Input
                  type="number"
                  value={newDiscount}
                  onChange={(e) => setNewDiscount(Number(e.target.value))}
                  className="rounded-xl text-xs font-bold font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">الحد الأدنى للطلب (ر.س):</label>
                <Input
                  type="number"
                  value={newMinOrder}
                  onChange={(e) => setNewMinOrder(Number(e.target.value))}
                  className="rounded-xl text-xs font-bold font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">الحد الأقصى للاستخدام:</label>
                <Input
                  type="number"
                  value={newMaxUsages}
                  onChange={(e) => setNewMaxUsages(Number(e.target.value))}
                  className="rounded-xl text-xs font-bold font-mono"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2 sm:justify-start">
            <Button
              variant="sovereign"
              size="sm"
              onClick={handleCreateCoupon}
              className="rounded-xl font-bold text-xs"
            >
              تفعيل الكوبون فوراً
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddCouponOpen(false)}
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
