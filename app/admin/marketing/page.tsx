"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Sparkles,
  Copy,
  CheckCircle2,
  Calendar,
  Percent,
  Flame,
  Layers,
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

const initialCoupons: PromoCoupon[] = [
  {
    id: "CP-01",
    code: "SOUQ2030",
    description: "كوبون احتفالية الرؤية واليوم الوطني",
    discountType: "percentage",
    discountValue: 10,
    minOrder: 1000,
    usages: 842,
    maxUsages: 2000,
    expiryDate: "٣١ ديسمبر ٢٠٢٦",
    active: true,
  },
  {
    id: "CP-02",
    code: "ROYAL_VIP",
    description: "خصم حصري لحاملي عضوية السيادة VIP",
    discountType: "percentage",
    discountValue: 15,
    minOrder: 10000,
    usages: 129,
    maxUsages: 500,
    expiryDate: "٣٠ نوفمبر ٢٠٢٦",
    active: true,
  },
  {
    id: "CP-03",
    code: "FOUNDING_DAY",
    description: "مكافأة يوم التأسيس السعودي",
    discountType: "fixed",
    discountValue: 500,
    minOrder: 5000,
    usages: 1500,
    maxUsages: 1500,
    expiryDate: "١ نوفمبر ٢٠٢٦",
    active: false,
  },
];

export default function MarketingEnginePage() {
  const [coupons, setCoupons] = useState<PromoCoupon[]>(initialCoupons);
  
  // Dialog state
  const [isAddCouponOpen, setIsAddCouponOpen] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDiscount, setNewDiscount] = useState(10);
  const [newMinOrder, setNewMinOrder] = useState(1000);

  // Flash Sale state
  const [flashSaleActive, setFlashSaleActive] = useState(true);
  const [flashSaleTitle, setFlashSaleTitle] = useState("خزائن صقور الجزيرة • إصدارات محدودة");
  const [flashSaleEnd, setFlashSaleEnd] = useState("٢٤ ساعة و ٠٤ دقائق متبقية");

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`تم نسخ الكوبون "${code}" إلى الحافظة!`);
  };

  const handleToggleCoupon = (id: string, code: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
    toast.info(`تم تحديث حالة تفعيل الكوبون "${code}".`);
  };

  const handleCreateCoupon = () => {
    if (!newCode.trim()) {
      toast.error("يرجى إدخال رمز الكوبون");
      return;
    }
    const coupon: PromoCoupon = {
      id: `CP-${Date.now()}`,
      code: newCode.toUpperCase().trim(),
      description: newDesc || "كوبون ترويجي معتمد",
      discountType: "percentage",
      discountValue: Number(newDiscount),
      minOrder: Number(newMinOrder),
      usages: 0,
      maxUsages: 1000,
      expiryDate: "٣١ يناير ٢٠٢٧",
      active: true,
    };
    setCoupons((prev) => [coupon, ...prev]);
    toast.success(`تم إنشاء ونشر الكوبون "${coupon.code}" بنجاح!`);
    setIsAddCouponOpen(false);
    setNewCode("");
    setNewDesc("");
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
            إطلاق كوبونات الخصم السيادية، جدولة مزادات الخزائن الملكية، والتحكم في لافتات الصفحة الرئيسية.
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
            <span className="text-[11px] font-mono text-emerald-400 font-bold">مفعلة على الرئيسية</span>
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
            onClick={() => {
              setFlashSaleActive(!flashSaleActive);
              toast.info(flashSaleActive ? "تم إيقاف مؤقت الخزينة السريعة" : "تم استئناف حملة الخزينة");
            }}
            className="rounded-xl bg-slate-900/80 text-white border-slate-700 text-xs font-bold"
          >
            {flashSaleActive ? "إيقاف الحملة مؤقتاً" : "إعادة تفعيل"}
          </Button>

          <Button
            variant="gold"
            size="sm"
            onClick={() => toast.success("تم تحديث إعدادات الحملة وخصومات القطع")}
            className="rounded-xl text-xs font-bold"
          >
            تعديل خصم الحملة
          </Button>
        </div>
      </div>

      {/* Active Coupons List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">
            كوبونات الخصم وقسائم الشراء المعتمدة
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

                  <td className="p-4 font-mono font-medium text-slate-700">
                    {formatSAR(c.minOrder)}
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">
                        {c.usages} / {c.maxUsages}
                      </span>
                    </div>
                    <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-[#006948] rounded-full"
                        style={{ width: `${Math.min((c.usages / c.maxUsages) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </td>

                  <td className="p-4 text-slate-500 font-medium">
                    {c.expiryDate}
                  </td>

                  <td className="p-4">
                    {c.active ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 ml-1 text-emerald-600" />
                        ساري ونشط
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-300">
                        منتهي أو معطل
                      </Badge>
                    )}
                  </td>

                  <td className="p-4 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleCoupon(c.id, c.code)}
                      className="rounded-xl text-xs h-8"
                    >
                      {c.active ? "تعطيل" : "إعادة تفعيل"}
                    </Button>
                  </td>
                </tr>
              ))}
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
              <label className="text-xs font-bold text-slate-700 block mb-1">
                رمز الكوبون (Promo Code):
              </label>
              <Input
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="مثال: AL_YAMAMA_20"
                className="rounded-xl font-mono uppercase text-xs font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                الوصف والمناسبة:
              </label>
              <Input
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="مثال: خصم خاص لعملاء قصر اليمامة"
                className="rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  نسبة الخصم (%):
                </label>
                <Input
                  type="number"
                  value={newDiscount}
                  onChange={(e) => setNewDiscount(Number(e.target.value))}
                  className="rounded-xl text-xs font-bold font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  الحد الأدنى للطلب (ر.س):
                </label>
                <Input
                  type="number"
                  value={newMinOrder}
                  onChange={(e) => setNewMinOrder(Number(e.target.value))}
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

