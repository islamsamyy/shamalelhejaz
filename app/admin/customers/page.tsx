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
  Users,
  Search,
  Wallet,
  Crown,
  MapPin,
  PlusCircle,
} from "lucide-react";
import { formatSAR } from "@/lib/utils";
import { toast } from "sonner";

interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  role: "admin" | "vendor" | "customer";
  tier: "VIP Sovereign" | "Corporate" | "Individual";
  totalSpent: number;
  ordersCount: number;
  walletBalance: number;
  joinedDate: string;
}

export default function CustomerCrmPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTier, setFilterTier] = useState<string>("all");

  // Wallet adjustment modal state
  const [adjustingCustomer, setAdjustingCustomer] = useState<CustomerRecord | null>(null);
  const [creditAmount, setCreditAmount] = useState<number>(1000);
  const [adjustmentReason, setAdjustmentReason] = useState("مكافأة ولاء سيادية");

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const [profRes, walRes, ordRes] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("wallets").select("user_id, balance"),
        supabase.from("orders").select("user_id, total"),
      ]);

      const walletsByUser = new Map<string, number>();
      (walRes.data || []).forEach((w: any) => walletsByUser.set(w.user_id, Number(w.balance || 0)));

      const spentByUser = new Map<string, { total: number; count: number }>();
      (ordRes.data || []).forEach((o: any) => {
        if (!o.user_id) return;
        const curr = spentByUser.get(o.user_id) || { total: 0, count: 0 };
        curr.total += Number(o.total || 0);
        curr.count += 1;
        spentByUser.set(o.user_id, curr);
      });

      const mapped: CustomerRecord[] = (profRes.data || []).map((p: any) => {
        const stats = spentByUser.get(p.id) || { total: 0, count: 0 };
        const tier: CustomerRecord["tier"] =
          p.tier === "VIP Sovereign" || p.tier === "Corporate"
            ? p.tier
            : p.role === "vendor"
            ? "Corporate"
            : stats.total >= 50000
            ? "VIP Sovereign"
            : "Individual";

        return {
          id: p.id,
          name: p.full_name || p.email?.split("@")[0] || "مستخدم مسجل",
          phone: p.phone || "—",
          email: p.email || "—",
          city: p.city || "الرياض",
          role: p.role || "customer",
          tier,
          totalSpent: stats.total,
          ordersCount: stats.count,
          walletBalance: walletsByUser.get(p.id) || 0,
          joinedDate: p.created_at ? new Date(p.created_at).toLocaleDateString("ar-SA") : "—",
        };
      });

      setCustomers(mapped);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const filtered = customers.filter((c) => {
    const matchesTier = filterTier === "all" || c.tier === filterTier;
    const matchesSearch =
      c.name.includes(search) ||
      c.phone.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.city.includes(search);
    return matchesTier && matchesSearch;
  });

  const totalWalletBalance = customers.reduce((acc, c) => acc + c.walletBalance, 0);

  const handleAdjustWallet = async () => {
    if (!adjustingCustomer) return;
    const amount = Number(creditAmount);
    if (!amount) {
      toast.error("يرجى إدخال قيمة صحيحة");
      return;
    }

    const { data: newBalance, error } = await supabase.rpc("admin_credit_wallet", {
      p_user_id: adjustingCustomer.id,
      p_amount: amount,
      p_reason: adjustmentReason,
    });

    if (error) {
      toast.error(`تعذر تعديل المحفظة: ${error.message}`);
      return;
    }

    setCustomers((prev) =>
      prev.map((c) =>
        c.id === adjustingCustomer.id
          ? { ...c, walletBalance: Number(newBalance ?? c.walletBalance + amount) }
          : c
      )
    );
    toast.success(
      `تم إيداع ${formatSAR(amount)} في محفظة "${adjustingCustomer.name}" وتسجيل الحركة في قاعدة البيانات!`
    );
    setAdjustingCustomer(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Users className="w-7 h-7 text-[#006948]" />
            سجل المقتنين والعملاء وإدارة المحافظ
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            إدارة حسابات المستخدمين المسجلين فعلياً في Supabase وأرصدة محافظهم ({customers.length} حساب).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 font-mono text-xs">
            إجمالي رصيد المحافظ: {formatSAR(totalWalletBalance)}
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
            placeholder="ابحث باسم المقتني، البريد الإلكتروني، الجوال، أو المدينة..."
            className="pr-10 rounded-2xl border-slate-200 text-xs h-10 w-full"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: "all", label: "كافة الحسابات" },
            { id: "VIP Sovereign", label: "VIP ملكي" },
            { id: "Corporate", label: "شركات وتجار" },
            { id: "Individual", label: "أفراد" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTier(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filterTier === tab.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">اسم الحساب والمدينة</th>
                <th className="p-4">بيانات التواصل</th>
                <th className="p-4">الدور والشريحة</th>
                <th className="p-4">إجمالي المشتريات</th>
                <th className="p-4">رصيد المحفظة النشط</th>
                <th className="p-4 text-center">إدارة المحفظة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <span className="font-bold text-slate-900 block">{c.name}</span>
                    <span className="text-[10px] text-emerald-800 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-2.5 h-2.5" />
                      {c.city} • عضو منذ {c.joinedDate}
                    </span>
                  </td>

                  <td className="p-4">
                    <span className="font-mono text-slate-700 block">{c.phone}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{c.email}</span>
                  </td>

                  <td className="p-4">
                    {c.tier === "VIP Sovereign" && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-900 border-amber-300 font-bold">
                        <Crown className="w-3 h-3 ml-1 fill-amber-500 text-amber-500" />
                        عضوية سيادية VIP
                      </Badge>
                    )}
                    {c.tier === "Corporate" && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-900 border-blue-300 font-bold">
                        حساب تاجر / شركات
                      </Badge>
                    )}
                    {c.tier === "Individual" && (
                      <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">
                        {c.role === "admin" ? "مشرف نظام (Admin)" : "مقتني فردي"}
                      </Badge>
                    )}
                  </td>

                  <td className="p-4">
                    <span className="font-black text-slate-900 block">{formatSAR(c.totalSpent)}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{c.ordersCount} طلبات</span>
                  </td>

                  <td className="p-4">
                    <span className="font-black text-[#006948] text-sm block">{formatSAR(c.walletBalance)}</span>
                    <span className="text-[10px] text-emerald-700">رصيد فعلي في wallets</span>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="sovereign"
                        size="sm"
                        onClick={() => {
                          setAdjustingCustomer(c);
                          setCreditAmount(1000);
                        }}
                        className="h-8 px-3 rounded-xl text-xs font-bold"
                      >
                        <PlusCircle className="w-3.5 h-3.5 ml-1" />
                        إيداع رصيد
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    لا توجد حسابات مطابقة حالياً.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Wallet Balance Modal */}
      <Dialog open={!!adjustingCustomer} onOpenChange={() => setAdjustingCustomer(null)}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-[#006948]" />
              إيداع رصيد في محفظة المستخدم (Supabase RPC)
            </DialogTitle>
          </DialogHeader>

          {adjustingCustomer && (
            <div className="space-y-4 my-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-200/80">
                <div>
                  <span className="font-bold text-slate-900 block">{adjustingCustomer.name}</span>
                  <span className="font-mono text-slate-500 text-[10px]">{adjustingCustomer.email}</span>
                </div>
                <div className="text-left">
                  <span className="text-slate-400 text-[10px] block">الرصيد الحالي:</span>
                  <span className="font-bold text-[#006948]">{formatSAR(adjustingCustomer.walletBalance)}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  المبلغ المودع (ريال سعودي):
                </label>
                <Input
                  type="number"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(Number(e.target.value))}
                  className="rounded-xl text-sm font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  سبب الإيداع أو المناسبة:
                </label>
                <Input
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="rounded-xl text-xs"
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:justify-start">
            <Button
              variant="sovereign"
              size="sm"
              onClick={handleAdjustWallet}
              className="rounded-xl font-bold text-xs"
            >
              تأكيد الإيداع الفوري
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAdjustingCustomer(null)}
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
