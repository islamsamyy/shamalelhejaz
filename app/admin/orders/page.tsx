"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchOrdersFromSupabase } from "@/lib/supabase";
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
  Filter,
  CheckCircle2,
  AlertTriangle,
  Scale,
  RefreshCw,
  ExternalLink,
  MapPin,
  Clock,
  Building,
  User,
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
  status: "delivered" | "shipping" | "dispute" | "returned";
  disputeReason?: string;
  escrowStatus: "held" | "released" | "refunded";
}

const mockOrders: AdminOrder[] = [
  {
    id: "SQ-94281",
    date: "اليوم، 09:30 ص",
    customerName: "سعادة الدكتور فهد آل سعود",
    customerPhone: "+966 50 123 4567",
    city: "الرياض - حي حطين",
    vendor: "دار الصائغ الملكية",
    items: "ساعة الصقر الكرونوغراف KSA-01 (قطعة واحدة)",
    amount: 48500,
    carrier: "SPL Express (سبل)",
    waybill: "SPL-81920491",
    status: "shipping",
    escrowStatus: "held",
  },
  {
    id: "SQ-94280",
    date: "أمس، 05:15 م",
    customerName: "الأستاذ سلطان العتيبي",
    customerPhone: "+966 55 987 6543",
    city: "جدة - حي الشاطئ",
    vendor: "مشالح الأحساء التاريخية",
    items: "بشت حساوي ملكي غاط ياباني ملوكي",
    amount: 18500,
    carrier: "SMSA Express",
    waybill: "SMSA-9920192",
    status: "dispute",
    disputeReason: "تأخر المندوب في تسليم الشحنة وعدم مطابقة مقاس الطول المطلوب (طلب استبدال)",
    escrowStatus: "held",
  },
  {
    id: "SQ-94279",
    date: "أمس، 02:40 م",
    customerName: "الأستاذة سارة الشمري",
    customerPhone: "+966 53 444 3322",
    city: "الخبر - الكورنيش",
    vendor: "بيت العود المعتق",
    items: "دهن عود كلمنتان غابات ملكي 40 عاماً",
    amount: 9200,
    carrier: "SPL Express (سبل)",
    waybill: "SPL-81920488",
    status: "delivered",
    escrowStatus: "released",
  },
  {
    id: "SQ-94278",
    date: "٧ نوفمبر ٢٠٢٦",
    customerName: "المهندس بندر القحطاني",
    customerPhone: "+966 54 888 7766",
    city: "الرياض - الياسمين",
    vendor: "صاغة الجنوب التراثية",
    items: "خنجر نجدي ناصري مقبض زراف",
    amount: 36000,
    carrier: "SPL Express (سبل)",
    waybill: "SPL-81920475",
    status: "dispute",
    disputeReason: "العميل يطلب فحص إضافي لشهادة الياقوت الطبيعي قبل الإفراج عن المبلغ",
    escrowStatus: "held",
  },
  {
    id: "SQ-94277",
    date: "٦ نوفمبر ٢٠٢٦",
    customerName: "عبدالرحمن بن ناصر",
    customerPhone: "+966 56 112 2334",
    city: "الدمام - الشاطئ",
    vendor: "لوازم الفروسية الملكية",
    items: "سرج خيل عربي أصيل مطرز بالفضة",
    amount: 24500,
    carrier: "SMSA Express",
    waybill: "SMSA-9920150",
    status: "delivered",
    escrowStatus: "released",
  },
];

export default function OrderOperationsPage() {
  const [orders, setOrders] = useState<AdminOrder[]>(mockOrders);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  
  // Dispute Modal State
  const [selectedDispute, setSelectedDispute] = useState<AdminOrder | null>(null);

  useEffect(() => {
    async function loadDbOrders() {
      try {
        const dbOrders = await fetchOrdersFromSupabase();
        if (dbOrders && dbOrders.length > 0) {
          const mapped: AdminOrder[] = dbOrders.map((o: any) => ({
            id: o.id,
            date: new Date(o.created_at).toLocaleDateString("ar-SA"),
            customerName: o.shipping_address?.fullName || "مشتري موثق",
            customerPhone: o.shipping_address?.phone || "+966 50 000 0000",
            city: o.shipping_address?.city || "الرياض",
            vendor: o.items?.[0]?.vendor || "سوق السعودية",
            items: o.items?.map((it: any) => `${it.title} (${it.quantity})`).join(", ") || "طلب مشتريات",
            amount: Number(o.total),
            carrier: "SPL Express (سبل)",
            waybill: `SPL-${o.id.replace(/\D/g, "").slice(0, 8) || "81920491"}`,
            status: o.status === "confirmed" ? "shipping" : o.status === "delivered" ? "delivered" : "shipping",
            escrowStatus: "held",
          }));
          setOrders([...mapped, ...mockOrders]);
        }
      } catch (e) {
        console.warn("Could not load dynamic orders:", e);
      }
    }
    loadDbOrders();
  }, []);

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = filterStatus === "all" || o.status === filterStatus;
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.includes(search) ||
      o.vendor.includes(search) ||
      o.waybill.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleResolveDispute = (action: "release_vendor" | "refund_customer") => {
    if (!selectedDispute) return;
    if (action === "release_vendor") {
      setOrders((prev) =>
        prev.map((ord) =>
          ord.id === selectedDispute.id
            ? { ...ord, status: "delivered", escrowStatus: "released" }
            : ord
        )
      );
      toast.success(`تم التحكيم لصالح المنشأة وتحرير مبلغ ${formatSAR(selectedDispute.amount)} للتاجر!`);
    } else {
      setOrders((prev) =>
        prev.map((ord) =>
          ord.id === selectedDispute.id
            ? { ...ord, status: "returned", escrowStatus: "refunded" }
            : ord
        )
      );
      toast.success(`تم استرجاع مبلغ ${formatSAR(selectedDispute.amount)} إلى محفظة المقتني فورياً!`);
    }
    setSelectedDispute(null);
  };

  const handleResendOtp = (id: string, phone: string) => {
    toast.success(`تمت إعادة توليد وإرسال رمز التسليم السري (OTP) إلى هاتف المقتني ${phone}`);
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
            رقابة لحظية على حركة الشحنات عبر سبل وسمسا، وفض النزاعات والتحكم بأرصدة الضمان (SAMA Escrow).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 font-mono text-xs">
            الربط اللوجستي: SPL / SMSA نشط
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
            { id: "dispute", label: "نزاع مفتوح" },
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
                <th className="p-4 text-center">التحكيم والتدخل</th>
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
                        جاري الشحن
                      </Badge>
                    )}
                    {ord.status === "delivered" && (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 ml-1 text-emerald-600" />
                        تم التسليم
                      </Badge>
                    )}
                    {ord.status === "dispute" && (
                      <Badge variant="outline" className="bg-rose-50 text-rose-800 border-rose-300 animate-pulse">
                        <AlertTriangle className="w-3 h-3 ml-1 text-rose-600" />
                        نزاع معلق
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
                      {ord.status === "dispute" ? (
                        <Button
                          variant="sovereign"
                          size="sm"
                          onClick={() => setSelectedDispute(ord)}
                          className="h-8 px-3 rounded-xl font-black text-xs bg-rose-600 hover:bg-rose-700"
                        >
                          <Scale className="w-3.5 h-3.5 ml-1" />
                          فض النزاع
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResendOtp(ord.id, ord.customerPhone)}
                          title="إعادة إرسال كود الاستلام OTP"
                          className="h-8 px-2.5 rounded-xl border-slate-200 text-slate-700 text-xs"
                        >
                          <RefreshCw className="w-3 h-3 ml-1 text-slate-400" />
                          إعادة OTP
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

      {/* Dispute Resolution Modal */}
      <Dialog open={!!selectedDispute} onOpenChange={() => setSelectedDispute(null)}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#006948]" />
              لجنة التحكيم وفض النزاعات السيادية
            </DialogTitle>
          </DialogHeader>

          {selectedDispute && (
            <div className="space-y-4 my-2 text-xs">
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl">
                <span className="font-bold text-rose-900 block mb-1">سبب البلاغ المرفوع من المقتني:</span>
                <p className="text-rose-800 leading-relaxed">{selectedDispute.disputeReason}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-slate-400 text-[10px] block">رقم الطلب:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedDispute.id}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">المبلغ المتنازع عليه:</span>
                  <span className="font-black text-[#006948]">{formatSAR(selectedDispute.amount)}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">اسم المقتني:</span>
                  <span className="font-bold text-slate-800">{selectedDispute.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">المنشأة التاجرة:</span>
                  <span className="font-bold text-slate-800">{selectedDispute.vendor}</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-900">
                <span>تنبيه: قرار التحكيم نهائي وسيترتب عليه تسوية رصيد الضمان فورياً عبر شبكة ساما.</span>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="sovereign"
              size="sm"
              onClick={() => handleResolveDispute("release_vendor")}
              className="rounded-xl font-bold text-xs flex-1"
            >
              تحرير الضمان للتاجر
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleResolveDispute("refund_customer")}
              className="rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs flex-1"
            >
              استرجاع كامل للمقتني
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

