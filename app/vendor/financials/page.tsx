"use client";

import React, { useState } from "react";
import Link from "next/link";
import VendorNav from "@/components/vendor/VendorNav";
import StorefrontFooter from "@/components/StorefrontFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DollarSign,
  TrendingUp,
  Download,
  ShieldCheck,
  Building,
  CheckCircle2,
  ChevronLeft,
  ArrowLeft,
  Clock,
  Lock,
} from "lucide-react";
import { formatSAR } from "@/lib/utils";
import { toast } from "sonner";

export default function VendorFinancialsPage() {
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [availableBalance, setAvailableBalance] = useState(399800);
  const [payoutAmount, setPayoutAmount] = useState(50000);
  const [pendingEscrow, setPendingEscrow] = useState(85200);

  const transactions = [
    { id: "TX-9104", orderId: "SQ-94281", type: "حجز ضمان (Escrow)", amount: 48500, status: "معلق حتى الفحص", date: "٩ نوفمبر ٢٠٢٦" },
    { id: "TX-8921", orderId: "SQ-89104", type: "تحويل أرباح معتمد", amount: 11500, status: "تم التحويل لحساب SNB", date: "٢٨ أكتوبر ٢٠٢٦" },
    { id: "TX-8840", orderId: "SQ-88120", type: "تحويل أرباح معتمد", amount: 24200, status: "تم التحويل لحساب SNB", date: "٢٢ أكتوبر ٢٠٢٦" },
    { id: "TX-8701", orderId: "SQ-87490", type: "تسوية ضريبية ZATCA", amount: 3630, status: "مخصوم ومعتمد", date: "١٥ أكتوبر ٢٠٢٦" },
  ];

  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (payoutAmount > availableBalance) {
      toast.error("المبلغ المطلوب أكبر من الرصيد المتاح للتحويل.");
      return;
    }
    setAvailableBalance((prev) => prev - Number(payoutAmount));
    setIsPayoutModalOpen(false);
    toast.success(`تم إرسال طلب تحويل أرباح بمبلغ ${formatSAR(Number(payoutAmount))} لحساب SNB بنجاح عبر نظام سريع!`);
  };

  const handleDownloadTaxReport = () => {
    toast.success("تم إعداد وتحميل كشف التسويات الضريبية ZATCA Phase-2 بصيغة XML/PDF!");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col">
      <VendorNav />

      <main className="flex-1">
        <section className="bg-white border-b border-slate-200/80 py-8">
          <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
            <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2">
              <Link href="/vendor" className="hover:text-[#006948] transition-colors">بوابة التجار</Link>
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="text-[#006948] font-bold">اللوحة المالية وحساب التسويات</span>
            </nav>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="sovereign">حساب الضمان البنكي ساما (SAMA ESCROW)</Badge>
                  <span className="text-xs text-slate-400">الآيبان: SA4210000001234567890123</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                  اللوحة المالية والتسويات والتقارير الضريبية
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleDownloadTaxReport} className="gap-1.5 font-bold">
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>تحميل كشف زاتكا (XML)</span>
                </Button>
                <Button variant="sovereign" size="sm" onClick={() => setIsPayoutModalOpen(true)} className="font-bold">
                  طلب تحويل الأرباح (سريع)
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8 space-y-8">
          {/* Financial Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-md">
              <span className="text-xs font-bold text-slate-500 block mb-1">الرصيد المتاح للتحويل الفوري</span>
              <span className="text-3xl font-black text-[#006948]">{formatSAR(availableBalance)}</span>
              <span className="text-[10px] text-emerald-700 block mt-1 font-bold">جاهز للإيداع في الحساب البنكي</span>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-md">
              <span className="text-xs font-bold text-slate-500 block mb-1">مبالغ الضمان المعلقة (Escrow)</span>
              <span className="text-3xl font-black text-amber-600">{formatSAR(pendingEscrow)}</span>
              <span className="text-[10px] text-slate-400 block mt-1">تُفرج تلقائياً بعد استلام المقتني بـ ٤٨ ساعة</span>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-md">
              <span className="text-xs font-bold text-slate-500 block mb-1">إجمالي المبيعات المحققة</span>
              <span className="text-3xl font-black text-slate-900">{formatSAR(485000)}</span>
              <span className="text-[10px] text-emerald-700 block mt-1 font-bold">شامل ضريبة زاتكا 15%</span>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-md space-y-4">
            <h3 className="text-base font-black text-slate-900">سجل حركات المحفظة والتسويات البنكية</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400">
                    <th className="py-3 px-4 font-bold">رقم الحركة</th>
                    <th className="py-3 px-4 font-bold">رقم الطلب المرتبط</th>
                    <th className="py-3 px-4 font-bold">نوع المعاملة</th>
                    <th className="py-3 px-4 font-bold">المبلغ</th>
                    <th className="py-3 px-4 font-bold">الحالة</th>
                    <th className="py-3 px-4 font-bold">التاريخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-slate-900">{tx.id}</td>
                      <td className="py-4 px-4 font-mono font-bold text-[#006948]">{tx.orderId}</td>
                      <td className="py-4 px-4 font-medium text-slate-800">{tx.type}</td>
                      <td className="py-4 px-4 font-black text-slate-900">{formatSAR(tx.amount)}</td>
                      <td className="py-4 px-4">
                        <Badge variant="sovereign">{tx.status}</Badge>
                      </td>
                      <td className="py-4 px-4 text-slate-500">{tx.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* Payout Request Modal Dialog */}
      <Dialog open={isPayoutModalOpen} onOpenChange={setIsPayoutModalOpen}>
        <DialogContent className="max-w-md text-right">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">طلب تحويل أرباح فوري (سريع)</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              سيتم تحويل المبلغ لحساب المنشأة البنكي في البنك الأهلي السعودي (SNB).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRequestPayout} className="space-y-4 my-2">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">المبلغ المراد تحويله (ر.س)</label>
              <Input
                type="number"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(Number(e.target.value))}
                max={availableBalance}
                min={1000}
                step={1000}
                required
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                الرصيد المتاح: {formatSAR(availableBalance)}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 text-xs text-slate-700 space-y-1 border border-slate-200">
              <div className="flex justify-between">
                <span>البنك المستلم:</span>
                <span className="font-bold text-slate-900">البنك الأهلي السعودي (SNB)</span>
              </div>
              <div className="flex justify-between">
                <span>الآيبان:</span>
                <span className="font-mono text-emerald-800 font-bold">SA42...890123</span>
              </div>
              <div className="flex justify-between">
                <span>زمن المعالجة:</span>
                <span className="font-bold text-emerald-700">فوري عبر نظام سريع IPS</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsPayoutModalOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" variant="sovereign">
                تأكيد التحويل البنكي
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <StorefrontFooter />
    </div>
  );
}
