"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Receipt,
  Download,
  Building,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Wallet,
  DollarSign,
} from "lucide-react";
import { formatSAR } from "@/lib/utils";
import { toast } from "sonner";

interface PayoutBatch {
  id: string;
  vendorId: string;
  vendorName: string;
  iban: string;
  ordersCount: number;
  grossAmount: number;
  platformFee: number;
  netPayout: number;
  status: "pending" | "paid" | "rejected";
}

export default function PlatformFinancePage() {
  const [batches, setBatches] = useState<PayoutBatch[]>([]);
  const [summary, setSummary] = useState({ escrowHeld: 0, vatCollected: 0, platformCommission: 0 });
  const [loading, setLoading] = useState(true);
  const [isConfirmBatchOpen, setIsConfirmBatchOpen] = useState(false);

  const loadFinance = useCallback(async () => {
    setLoading(true);
    try {
      const [payRes, venRes, ordRes, oiRes] = await Promise.all([
        supabase.from("vendor_payouts").select("*").order("created_at", { ascending: false }),
        supabase.from("vendors").select("id, name, iban, commission_rate"),
        supabase.from("orders").select("id, total, tax, status, payment_status"),
        supabase.from("order_items").select("vendor_id, line_total"),
      ]);

      const vendorsMap = new Map<string, { name: string; iban: string; rate: number }>();
      (venRes.data || []).forEach((v: any) =>
        vendorsMap.set(v.id, {
          name: v.name,
          iban: v.iban || "SA0000000000000000000000",
          rate: Number(v.commission_rate ?? 8),
        })
      );

      const orders = ordRes.data || [];
      const orderItems = oiRes.data || [];

      const escrowHeld = orders
        .filter((o) => o.status !== "delivered" && o.status !== "cancelled" && o.status !== "returned")
        .reduce((acc, o) => acc + Number(o.total || 0), 0);
      const vatCollected = orders.reduce((acc, o) => acc + Number(o.tax || 0), 0);
      const platformCommission = orderItems.reduce((acc, oi: any) => {
        const rate = vendorsMap.get(oi.vendor_id)?.rate ?? 8;
        return acc + (Number(oi.line_total || 0) * rate) / 100;
      }, 0);

      setSummary({
        escrowHeld,
        vatCollected,
        platformCommission: Math.round(platformCommission * 100) / 100,
      });

      const mapped: PayoutBatch[] = (payRes.data || []).map((p: any) => {
        const vInfo = vendorsMap.get(p.vendor_id);
        const rate = vInfo?.rate ?? 8;
        const gross = Number(p.amount || 0);
        const fee = Math.round(((gross * rate) / 100) * 100) / 100;
        const vOrders = orderItems.filter((oi) => oi.vendor_id === p.vendor_id).length;

        return {
          id: p.id,
          vendorId: p.vendor_id,
          vendorName: vInfo?.name || p.vendor_id,
          iban: vInfo?.iban || "SA0000000000000000000000",
          ordersCount: vOrders,
          grossAmount: gross,
          platformFee: fee,
          netPayout: Math.max(0, gross - fee),
          status: p.status,
        };
      });

      setBatches(mapped);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFinance();
  }, [loadFinance]);

  const pendingBatches = batches.filter((b) => b.status === "pending");
  const totalPendingPayout = pendingBatches.reduce((acc, curr) => acc + curr.netPayout, 0);

  const handleReleaseSingle = async (batch: PayoutBatch) => {
    const { error } = await supabase
      .from("vendor_payouts")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", batch.id);

    if (error) {
      toast.error(`تعذر صرف الدفعة: ${error.message}`);
      return;
    }

    setBatches((prev) =>
      prev.map((item) => (item.id === batch.id ? { ...item, status: "paid" } : item))
    );
    toast.success(`تم تحويل ${formatSAR(batch.netPayout)} إلى حساب "${batch.vendorName}" وتحديث قاعدة البيانات!`);
  };

  const handleReleaseAllPending = async () => {
    const ids = pendingBatches.map((b) => b.id);
    if (ids.length === 0) return;

    const { error } = await supabase
      .from("vendor_payouts")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .in("id", ids);

    if (error) {
      toast.error(`تعذر صرف الدفعات: ${error.message}`);
      return;
    }

    setBatches((prev) => prev.map((b) => (b.status === "pending" ? { ...b, status: "paid" } : b)));
    toast.success(
      `تم صرف مستحقات التجار بقيمة ${formatSAR(totalPendingPayout)} وتحديث السجلات في قاعدة البيانات!`
    );
    setIsConfirmBatchOpen(false);
  };

  const handleDownloadZatcaReport = async () => {
    const { data: invoices } = await supabase.from("invoices").select("*");
    const blob = new Blob([JSON.stringify(invoices || [], null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zatca-invoices-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("تم تنزيل سجل الفواتير الضريبية ZATCA من قاعدة البيانات!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Receipt className="w-7 h-7 text-[#006948]" />
            التسويات المالية وضريبة الزكاة والجمارك (ZATCA)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            إدارة حساب الضمان المصرفي SAMA Escrow، تحرير مستحقات البائعين (`vendor_payouts`)، ومطابقة ضريبة 15%.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadZatcaReport}
            className="rounded-xl border-slate-300 text-xs font-bold"
          >
            <Download className="w-3.5 h-3.5 ml-1.5" />
            تصدير فواتير ZATCA
          </Button>

          {pendingBatches.length > 0 && (
            <Button
              variant="sovereign"
              size="sm"
              onClick={() => setIsConfirmBatchOpen(true)}
              className="rounded-xl font-bold text-xs"
            >
              <Wallet className="w-3.5 h-3.5 ml-1.5" />
              صرف مستحقات التجار ({formatSAR(totalPendingPayout)})
            </Button>
          )}
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-bold">محفظة ضمان ساما (SAMA Escrow)</span>
            <Building className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-3xl font-black text-[#006948] font-mono">
            {formatSAR(summary.escrowHeld)}
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">إجمالي الطلبات قيد التنفيذ</span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-bold">ضريبة 15% المحصلة ZATCA</span>
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">
            {formatSAR(summary.vatCollected)}
          </div>
          <span className="text-[11px] text-emerald-800 font-bold block mt-1">محتسبة من الطلبات الفعلية</span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-bold">صافي عمولات المنصة السيادية</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-amber-700 font-mono">
            {formatSAR(summary.platformCommission)}
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">بحسب شرائح عمولة المتاجر</span>
        </div>
      </div>

      {/* Settlement Batches Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">
            دفعات تسوية مستحقات الشركاء والتجار (`vendor_payouts`)
          </h3>
          <Badge variant="outline" className="text-xs">
            {pendingBatches.length} دفعات معلقة
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">المنشأة والآيبان البنكي</th>
                <th className="p-4">عناصر الطلبات</th>
                <th className="p-4">إجمالي الدفعة</th>
                <th className="p-4">عمولة المنصة</th>
                <th className="p-4">صافي التحويل للتاجر</th>
                <th className="p-4">حالة التحويل</th>
                <th className="p-4 text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {batches.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <span className="font-bold text-slate-900 block">{b.vendorName}</span>
                    <span className="text-[10px] font-mono text-slate-500 mt-0.5 block">{b.iban}</span>
                  </td>

                  <td className="p-4 font-mono font-bold text-slate-800">{b.ordersCount} عناصر</td>

                  <td className="p-4 font-bold text-slate-900">{formatSAR(b.grossAmount)}</td>

                  <td className="p-4 font-mono text-amber-700 font-bold">-{formatSAR(b.platformFee)}</td>

                  <td className="p-4 font-black text-[#006948] text-sm">{formatSAR(b.netPayout)}</td>

                  <td className="p-4">
                    {b.status === "pending" ? (
                      <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300">
                        <Clock className="w-3 h-3 ml-1 text-amber-600" />
                        بانتظار الصرف
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 ml-1 text-emerald-600" />
                        تم التحويل (SARIE)
                      </Badge>
                    )}
                  </td>

                  <td className="p-4 text-center">
                    {b.status === "pending" ? (
                      <Button
                        variant="sovereign"
                        size="sm"
                        onClick={() => handleReleaseSingle(b)}
                        className="rounded-xl text-xs font-bold h-8"
                      >
                        صرف فردي
                      </Button>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-mono">مكتمل</span>
                    )}
                  </td>
                </tr>
              ))}

              {!loading && batches.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    لا توجد طلبات سحب مستحقات مسجلة حالياً في جدول `vendor_payouts`.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch Release Confirmation Modal */}
      <Dialog open={isConfirmBatchOpen} onOpenChange={setIsConfirmBatchOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-[#006948]" />
              تأكيد صرف مستحقات التجار المجمعة
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 my-2 text-xs">
            <p className="text-slate-600">
              أنت على وشك اعتماد صرف المستحقات المعلقة لـ {pendingBatches.length} منشآت تجارية:
            </p>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
              <span className="text-slate-500 text-[11px] block">إجمالي المبلغ المحول:</span>
              <span className="text-3xl font-black text-[#006948] font-mono block mt-1">
                {formatSAR(totalPendingPayout)}
              </span>
            </div>
          </div>

          <DialogFooter className="flex gap-2 sm:justify-start">
            <Button
              variant="sovereign"
              size="sm"
              onClick={handleReleaseAllPending}
              className="rounded-xl font-bold text-xs"
            >
              تأكيد وتنفيذ التحويل
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsConfirmBatchOpen(false)}
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
