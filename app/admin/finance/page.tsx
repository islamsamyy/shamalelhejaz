"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  ArrowUpRight,
  Wallet,
  DollarSign,
  FileText,
  AlertCircle,
} from "lucide-react";
import { formatSAR } from "@/lib/utils";
import { toast } from "sonner";

interface PayoutBatch {
  id: string;
  vendorName: string;
  iban: string;
  ordersCount: number;
  grossAmount: number;
  platformFee: number;
  netPayout: number;
  status: "pending_release" | "released";
}

const initialBatches: PayoutBatch[] = [
  {
    id: "PAY-901",
    vendorName: "دار الصائغ الملكية للمقتنيات",
    iban: "SA4480000201608010192841",
    ordersCount: 14,
    grossAmount: 485000,
    platformFee: 38800,
    netPayout: 446200,
    status: "pending_release",
  },
  {
    id: "PAY-902",
    vendorName: "مشالح الأحساء التاريخية",
    iban: "SA0380000192847291029381",
    ordersCount: 9,
    grossAmount: 185000,
    platformFee: 16650,
    netPayout: 168350,
    status: "pending_release",
  },
  {
    id: "PAY-903",
    vendorName: "بيت العود المعتق",
    iban: "SA1180000192847291029383",
    ordersCount: 22,
    grossAmount: 142000,
    platformFee: 14200,
    netPayout: 127800,
    status: "released",
  },
  {
    id: "PAY-904",
    vendorName: "صاغة الجنوب والمشغولات",
    iban: "SA9280000192847291029382",
    ordersCount: 6,
    grossAmount: 84000,
    platformFee: 5880,
    netPayout: 78120,
    status: "released",
  },
];

export default function PlatformFinancePage() {
  const [batches, setBatches] = useState<PayoutBatch[]>(initialBatches);
  const [isConfirmBatchOpen, setIsConfirmBatchOpen] = useState(false);

  const pendingBatches = batches.filter((b) => b.status === "pending_release");
  const totalPendingPayout = pendingBatches.reduce((acc, curr) => acc + curr.netPayout, 0);

  const handleDownloadZatcaReport = () => {
    toast.success("تم تنزيل حزمة الإقرار الضريبي ZATCA Phase-2 بصيغة XML الموقعة رقمياً!");
  };

  const handleReleaseAllPending = () => {
    setBatches((prev) =>
      prev.map((b) => ({ ...b, status: "released" }))
    );
    toast.success(
      `تم إرسال أوامر التحويل الفوري لمبلغ ${formatSAR(totalPendingPayout)} عبر نظام سريع (SARIE) بنجاح!`
    );
    setIsConfirmBatchOpen(false);
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
            إدارة حساب الضمان المصرفي SAMA Escrow، تحرير مستحقات البائعين، ومطابقة ضريبة 15% مع هيئة الزكاة.
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
            تحميل إقرار ZATCA XML
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
          <div className="text-3xl font-black text-[#006948] font-mono">{formatSAR(2490000)}</div>
          <span className="text-[11px] text-slate-400 block mt-1">مبالغ مؤمنة تحت الرقابة المصرفية</span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-bold">ضريبة 15% المحصلة ZATCA</span>
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">{formatSAR(7338060)}</div>
          <span className="text-[11px] text-emerald-800 font-bold block mt-1">فواتير مرحلة 2 متطابقة 100%</span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-bold">صافي عمولات المنصة السيادية</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-amber-700 font-mono">{formatSAR(3913632)}</div>
          <span className="text-[11px] text-slate-400 block mt-1">متوسط عمولة المنصة 8%</span>
        </div>
      </div>

      {/* Settlement Batches Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">
            دفعات تسوية مستحقات الشركاء والتجار (سريع SARIE)
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
                <th className="p-4">عدد الطلبات المنفذة</th>
                <th className="p-4">إجمالي المبيعات</th>
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

                  <td className="p-4 font-mono font-bold text-slate-800">
                    {b.ordersCount} طلبات
                  </td>

                  <td className="p-4 font-bold text-slate-900">
                    {formatSAR(b.grossAmount)}
                  </td>

                  <td className="p-4 font-mono text-amber-700 font-bold">
                    -{formatSAR(b.platformFee)}
                  </td>

                  <td className="p-4 font-black text-[#006948] text-sm">
                    {formatSAR(b.netPayout)}
                  </td>

                  <td className="p-4">
                    {b.status === "pending_release" ? (
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
                    {b.status === "pending_release" ? (
                      <Button
                        variant="sovereign"
                        size="sm"
                        onClick={() => {
                          setBatches((prev) =>
                            prev.map((item) => (item.id === b.id ? { ...item, status: "released" } : item))
                          );
                          toast.success(`تم تحويل ${formatSAR(b.netPayout)} إلى حساب "${b.vendorName}"!`);
                        }}
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
              أنت على وشك إصدار أوامر الصرف الفوري عبر البنك المركزي السعودي لـ {pendingBatches.length} منشآت تجارية:
            </p>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
              <span className="text-slate-500 text-[11px] block">إجمالي المبلغ المحول:</span>
              <span className="text-3xl font-black text-[#006948] font-mono block mt-1">
                {formatSAR(totalPendingPayout)}
              </span>
            </div>

            <p className="text-[11px] text-slate-500">
              سيتم إيداع المبالغ في الحسابات البنكية المعتمدة خلال دقائق مع إرسال إشعار تسوية رسمي.
            </p>
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

