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
  Truck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Scale,
  MapPin,
} from "lucide-react";
import { formatSAR } from "@/lib/utils";
import { toast } from "sonner";

interface AdminOrder {
  id: string;
  date: string;
  customerName: string;
  customerPhone: string;
  city: string;
  vendor: string;
  items: string;
  amount: number;
  carrier: string;
  waybill: string;
  dbStatus: string;
  status: "delivered" | "shipping" | "dispute" | "returned";
  disputeReason?: string;
  escrowStatus: "held" | "released" | "refunded";
}

export default function OrderOperationsPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(title, quantity, vendor_id)")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Could not load orders:", error.message);
        return;
      }

      const mapped: AdminOrder[] = (data || []).map((o: any) => {
        const orderItems = Array.isArray(o.order_items) && o.order_items.length > 0 ? o.order_items : o.items || [];
        const itemsSummary =
          orderItems.map((it: any) => `${it.title} (${it.quantity})`).join("، ") || "طلب مشتريات";
        const uiStatus: AdminOrder["status"] =
          o.status === "delivered"
            ? "delivered"
            : o.status === "returned"
            ? "returned"
            : o.status === "cancelled"
            ? "dispute"
            : "shipping";
        const escrowStatus: AdminOrder["escrowStatus"] =
          o.status === "delivered"
            ? "released"
            : o.payment_status === "refunded" || o.status === "returned"
            ? "refunded"
            : "held";

        return {
          id: o.id,
          date: o.created_at ? new Date(o.created_at).toLocaleDateString("ar-SA") : "",
          customerName: o.shipping_address?.full_name || o.shipping_address?.fullName || "مشتري موثق",
          customerPhone: o.shipping_address?.phone || "+966 50 000 0000",
          city: o.shipping_address?.city || "الرياض",
          vendor: orderItems[0]?.vendor_id || "سوق شمال الحجاز",
          items: itemsSummary,
          amount: Number(o.total || 0),
          carrier: "SPL Express (سبل)",
          waybill: o.tracking_number || `SPL-${String(o.id).slice(-8)}`,
          dbStatus: o.status,
          status: uiStatus,
          disputeReason: o.notes || "مراجعة حالة التسليم والضمان",
          escrowStatus,
        };
      });
      setOrders(mapped);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = filterStatus === "all" || o.status === filterStatus;
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.includes(search) ||
      o.vendor.includes(search) ||
      o.waybill.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleUpdateOrderStatus = async (
    order: AdminOrder,
    nextDbStatus: "shipped" | "delivered" | "returned" | "cancelled",
    nextPaymentStatus?: "paid" | "refunded"
  ) => {
    const updates: Record<string, any> = { status: nextDbStatus };
    if (nextPaymentStatus) updates.payment_status = nextPaymentStatus;

    const { error } = await supabase.from("orders").update(updates).eq("id", order.id);
    if (error) {
      toast.error(`تعذر تحديث الطلب: ${error.message}`);
      return;
    }
    toast.success(`تم تحديث حالة الطلب ${order.id} في قاعدة البيانات بنجاح.`);
    setSelectedOrder(null);
    loadOrders();
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Truck className="w-7 h-7 text-[#006948]" />
            إدارة العمليات اللوجستية والنزاعات
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            متابعة وتحديث حالات الطلبات الفعلية وأرصدة الضمان مباشرة في قاعدة البيانات.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 font-mono text-xs">
            إجمالي الطلبات: {orders.length}
          </Badge>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث برقم الطلب، اسم العميل، التاجر، أو بوليصة الشحن..."
            className="pr-10 rounded-2xl border-slate-200 text-xs h-10 w-full"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: "all", label: "كافة الشحنات" },
            { id: "shipping", label: "جاري الشحن" },
            { id: "delivered", label: "تم التسليم" },
            { id: "dispute", label: "نزاع / ملغى" },
            { id: "returned", label: "مسترجع" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filterStatus === tab.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">رقم وتاريخ الطلب</th>
                <th className="p-4">المقتني والوجهة</th>
                <th className="p-4">المنشأة والمقتنيات</th>
                <th className="p-4">القيمة والضمان</th>
                <th className="p-4">الناقل وبوليصة التتبع</th>
                <th className="p-4">حالة الشحنة</th>
                <th className="p-4 text-center">التحكم بالطلب</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <span className="font-mono font-bold text-slate-900 block">{ord.id}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{ord.date}</span>
                  </td>

                  <td className="p-4">
                    <span className="font-bold text-slate-800 block">{ord.customerName}</span>
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{ord.customerPhone}</span>
                    <span className="text-[10px] text-emerald-800 flex items-center gap-1 mt-0.5 font-medium">
                      <MapPin className="w-2.5 h-2.5" />
                      {ord.city}
                    </span>
                  </td>

                  <td className="p-4">
                    <span className="font-bold text-slate-800 block">{ord.vendor}</span>
                    <span className="text-[11px] text-slate-500 line-clamp-1 max-w-[200px]">
                      {ord.items}
                    </span>
                  </td>

                  <td className="p-4">
                    <span className="font-black text-slate-900 block">{formatSAR(ord.amount)}</span>
                    <span
                      className={`text-[10px] font-bold ${
                        ord.escrowStatus === "released"
                          ? "text-emerald-700"
                          : ord.escrowStatus === "refunded"
                          ? "text-rose-700"
                          : "text-amber-700"
                      }`}
                    >
                      {ord.escrowStatus === "released"
                        ? "الضمان: تم الصرف للتاجر"
                        : ord.escrowStatus === "refunded"
                        ? "الضمان: تم الاسترجاع للعميل"
                        : "الضمان: محتجز في ساما"}
                    </span>
                  </td>

                  <td className="p-4">
                    <span className="font-bold text-slate-800 block">{ord.carrier}</span>
                    <span className="text-[10px] font-mono text-emerald-700 block mt-0.5">
                      {ord.waybill}
                    </span>
                  </td>

                  <td className="p-4">
                    {ord.status === "shipping" && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-300">
                        <Truck className="w-3 h-3 ml-1 text-blue-600" />
                        جاري الشحن ({ord.dbStatus})
                      </Badge>
                    )}
                    {ord.status === "delivered" && (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 ml-1 text-emerald-600" />
                        تم التسليم
                      </Badge>
                    )}
                    {ord.status === "dispute" && (
                      <Badge variant="outline" className="bg-rose-50 text-rose-800 border-rose-300">
                        <AlertTriangle className="w-3 h-3 ml-1 text-rose-600" />
                        نزاع / ملغى
                      </Badge>
                    )}
                    {ord.status === "returned" && (
                      <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300">
                        مسترجع
                      </Badge>
                    )}
                  </td>

                  <td className="p-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(ord)}
                        className="h-8 px-3 rounded-xl font-bold text-xs border-slate-200"
                      >
                        <Scale className="w-3.5 h-3.5 ml-1" />
                        تحديث الحالة
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    لا توجد طلبات مطابقة حالياً في قاعدة البيانات.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Action & Dispute Resolution Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#006948]" />
              إدارة حالة الطلب وتسوية الضمان
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4 my-2 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-slate-400 text-[10px] block">رقم الطلب:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedOrder.id}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">إجمالي الطلب:</span>
                  <span className="font-black text-[#006948]">{formatSAR(selectedOrder.amount)}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">اسم المقتني:</span>
                  <span className="font-bold text-slate-800">{selectedOrder.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">الحالة الحالية:</span>
                  <span className="font-bold text-slate-800">{selectedOrder.dbStatus}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="sovereign"
              size="sm"
              onClick={() => selectedOrder && handleUpdateOrderStatus(selectedOrder, "delivered", "paid")}
              className="rounded-xl font-bold text-xs flex-1"
            >
              تأكيد التسليم وتحرير الضمان
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => selectedOrder && handleUpdateOrderStatus(selectedOrder, "returned", "refunded")}
              className="rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs flex-1"
            >
              استرجاع الطلب للعميل
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
