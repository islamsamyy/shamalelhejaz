"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import VendorNav from "@/components/vendor/VendorNav";
import StorefrontFooter from "@/components/StorefrontFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Package,
  Printer,
  FileText,
  Truck,
  CheckCircle2,
  ChevronLeft,
  ArrowLeft,
  Search,
  QrCode,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { formatSAR } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface VendorOrder {
  id: string;
  buyer: string;
  item: string;
  date: string;
  amount: number;
  carrier: string;
  waybillNumber: string;
  status: string;
  destination: string;
}

export default function VendorOrdersPage() {
  const [selectedWaybillOrder, setSelectedWaybillOrder] = useState<VendorOrder | null>(null);
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("فشل تحميل الطلبات: " + error.message);
        return;
      }

      const mapped: VendorOrder[] = (data || []).map((ord: any) => {
        const firstItem = Array.isArray(ord.items) && ord.items.length > 0 ? ord.items[0] : null;
        const buyerName =
          ord.shipping_address?.full_name ||
          ord.shipping_address?.name ||
          "عميل موثق عبر نفاذ";
        const city = ord.shipping_address?.city || "الرياض";
        const district = ord.shipping_address?.district || "المملكة العربية السعودية";

        return {
          id: ord.id,
          buyer: buyerName,
          item: firstItem?.title || "مقتنيات متعددة",
          date: new Date(ord.created_at).toLocaleDateString("ar-SA"),
          amount: Number(ord.total) || 0,
          carrier: ord.shipping_fee === 0 ? "SMSA Express (سمسا)" : "SPL Express (سبل)",
          waybillNumber: ord.tracking_number || `SPL-${ord.id.slice(0, 8).toUpperCase()}`,
          status: ord.status === "delivered" ? "تم التسليم" : ord.status === "shipped" ? "تم التسليم للناقل" : "جاري التجهيز",
          destination: `${city} - ${district}`,
        };
      });

      setOrders(mapped);
    } catch (err: any) {
      console.error("Error loading vendor orders:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const dbStatus = newStatus === "تم التسليم للناقل" ? "shipped" : "processing";
    const { error } = await supabase.from("orders").update({ status: dbStatus }).eq("id", id);
    if (error) {
      toast.error("فشل تحديث حالة الطلب: " + error.message);
      return;
    }
    setOrders((prev) =>
      prev.map((ord) => (ord.id === id ? { ...ord, status: newStatus } : ord))
    );
    toast.success(`تم تحديث حالة الطلب ${id} إلى "${newStatus}" في Supabase بنجاح!`);
  };

  const handlePrintWaybill = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
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
              <span className="text-[#006948] font-bold">إدارة الطلبات وبوالص الشحن</span>
            </nav>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="sovereign">مركز العمليات اللوجستية</Badge>
                  <span className="text-xs text-slate-400">الربط المباشر مع SMSA و SPL</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                  إدارة طلبات المقتنين وبوالص الشحن المصفح
                </h1>
              </div>

              <Button asChild variant="outline" size="sm" className="font-bold">
                <Link href="/vendor">الرجوع للوحة المتجر</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-md space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">سجل الشحنات والطلبات الواردة ({orders.length})</h3>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                حسابات الضمان ساما نشطة
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400">
                    <th className="py-3 px-4 font-bold">رقم الطلب</th>
                    <th className="py-3 px-4 font-bold">المقتني والوجهة</th>
                    <th className="py-3 px-4 font-bold">القطعة الملكية</th>
                    <th className="py-3 px-4 font-bold">القيمة المودعة</th>
                    <th className="py-3 px-4 font-bold">الناقل وبوليصة الشحن</th>
                    <th className="py-3 px-4 font-bold">الحالة اللوجستية</th>
                    <th className="py-3 px-4 font-bold text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-slate-900">{ord.id}</td>
                      <td className="py-4 px-4">
                        <span className="font-bold text-slate-900 block">{ord.buyer}</span>
                        <span className="text-[11px] text-slate-500">{ord.destination}</span>
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-800">{ord.item}</td>
                      <td className="py-4 px-4 font-black text-[#006948]">{formatSAR(ord.amount)}</td>
                      <td className="py-4 px-4">
                        <span className="text-slate-800 font-bold block">{ord.carrier}</span>
                        <span className="font-mono text-[10px] text-slate-400">{ord.waybillNumber}</span>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="sovereign">{ord.status}</Badge>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedWaybillOrder(ord)}
                            className="text-xs font-bold gap-1"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>معاينة البوليصة</span>
                          </Button>
                          {ord.status !== "تم التسليم للناقل" && (
                            <Button
                              variant="sovereign"
                              size="sm"
                              onClick={() => handleUpdateStatus(ord.id, "تم التسليم للناقل")}
                              className="text-xs font-bold"
                            >
                              تسليم للناقل
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* Waybill Preview Modal Dialog */}
      {selectedWaybillOrder && (
        <Dialog open={!!selectedWaybillOrder} onOpenChange={(open) => !open && setSelectedWaybillOrder(null)}>
          <DialogContent className="max-w-xl text-right">
            <DialogHeader>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-emerald-800">بوليصة شحن أمني معتمدة (Waybill)</span>
                <Badge variant="sovereign">{selectedWaybillOrder.carrier}</Badge>
              </div>
              <DialogTitle className="text-base font-bold text-slate-900 mt-2">
                بوليصة رقم: {selectedWaybillOrder.waybillNumber}
              </DialogTitle>
            </DialogHeader>

            {/* Printable Waybill Sheet Design */}
            <div className="p-6 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 space-y-4 my-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">المرسل (التاجر المعتمد):</span>
                  <span className="text-xs font-bold text-slate-900 block">شركة دار الروضة للعود الفاخر</span>
                  <span className="text-[11px] text-slate-500">الرياض - السجل: 1010884920</span>
                </div>
                <div className="text-left">
                  <QrCode className="w-12 h-12 text-slate-900" />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="text-[10px] text-slate-400 block font-bold">المستلم والوجهة السيادية:</span>
                <span className="text-xs font-bold text-slate-900 block">{selectedWaybillOrder.buyer}</span>
                <span className="text-[11px] text-slate-600 font-medium">{selectedWaybillOrder.destination}</span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 flex justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">المحتوى:</span>
                  <span className="font-bold text-slate-900">{selectedWaybillOrder.item}</span>
                </div>
                <div className="text-left">
                  <span className="text-slate-400 block text-[10px]">القيمة المؤمنة:</span>
                  <span className="font-black text-[#006948]">{formatSAR(selectedWaybillOrder.amount)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setSelectedWaybillOrder(null)}>
                إغلاق
              </Button>
              <Button variant="sovereign" onClick={handlePrintWaybill} className="gap-1.5 font-bold">
                <Printer className="w-4 h-4" />
                <span>طباعة بوليصة الشحن</span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <StorefrontFooter />
    </div>
  );
}
