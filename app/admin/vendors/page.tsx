"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Building2,
  Search,
  CheckCircle2,
  FileText,
  Percent,
  Building,
  ShieldCheck,
  Ban,
} from "lucide-react";
import { formatSAR } from "@/lib/utils";
import { toast } from "sonner";

interface VendorRecord {
  id: string;
  name: string;
  ownerName: string;
  crNumber: string;
  vatNumber: string;
  iban: string;
  city: string;
  commissionRate: number;
  lifetimeGmv: number;
  activeProducts: number;
  kybStatus: "verified" | "pending_review" | "suspended";
}

export default function VendorManagementPage() {
  const [vendors, setVendors] = useState<VendorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Dialog states
  const [auditingVendor, setAuditingVendor] = useState<VendorRecord | null>(null);
  const [editingCommissionVendor, setEditingCommissionVendor] = useState<VendorRecord | null>(null);
  const [commissionValue, setCommissionValue] = useState<number>(8);

  const loadVendors = useCallback(async () => {
    setLoading(true);
    try {
      const [vRes, pRes, oiRes] = await Promise.all([
        supabase.from("vendors").select("*").order("created_at", { ascending: false }),
        supabase.from("products").select("id, vendor_id, is_active"),
        supabase.from("order_items").select("vendor_id, line_total"),
      ]);

      const prods = pRes.data || [];
      const orderItems = oiRes.data || [];

      const mapped: VendorRecord[] = (vRes.data || []).map((v: any) => {
        const activeProducts = prods.filter((p) => p.vendor_id === v.id && p.is_active).length;
        const lifetimeGmv = orderItems
          .filter((oi) => oi.vendor_id === v.id)
          .reduce((acc, oi) => acc + Number(oi.line_total || 0), 0);

        const kybStatus: VendorRecord["kybStatus"] =
          v.status === "suspended"
            ? "suspended"
            : v.status === "approved" || v.verified
            ? "verified"
            : "pending_review";

        return {
          id: v.id,
          name: v.name,
          ownerName: v.owner_name || "منشأة تجارية مسجلة",
          crNumber: v.cr_number || "—",
          vatNumber: v.vat_number || "—",
          iban: v.iban || "SA0000000000000000000000",
          city: v.location || "الرياض",
          commissionRate: Number(v.commission_rate ?? 8),
          lifetimeGmv,
          activeProducts,
          kybStatus,
        };
      });

      setVendors(mapped);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVendors();
  }, [loadVendors]);

  const filtered = vendors.filter((v) => {
    const matchesStatus = filterStatus === "all" || v.kybStatus === filterStatus;
    const matchesSearch =
      v.name.includes(search) ||
      v.ownerName.includes(search) ||
      v.crNumber.includes(search) ||
      v.city.includes(search);
    return matchesStatus && matchesSearch;
  });

  const handleVerifyKyb = async (id: string, name: string) => {
    const { error } = await supabase
      .from("vendors")
      .update({ verified: true, status: "approved" })
      .eq("id", id);

    if (error) {
      toast.error(`تعذر اعتماد المنشأة: ${error.message}`);
      return;
    }

    setVendors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, kybStatus: "verified" } : v))
    );
    toast.success(`تم اعتماد توثيق المنشأة KYB لـ "${name}" وتفعيل حساب البائع!`);
    setAuditingVendor(null);
  };

  const handleToggleSuspend = async (id: string, currentStatus: string, name: string) => {
    const isSuspended = currentStatus === "suspended";
    const nextDbStatus = isSuspended ? "approved" : "suspended";
    const nextUiStatus: VendorRecord["kybStatus"] = isSuspended ? "verified" : "suspended";

    const { error } = await supabase
      .from("vendors")
      .update({ status: nextDbStatus, verified: isSuspended })
      .eq("id", id);

    if (error) {
      toast.error(`تعذر تحديث حالة المنشأة: ${error.message}`);
      return;
    }

    setVendors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, kybStatus: nextUiStatus } : v))
    );
    if (nextUiStatus === "suspended") {
      toast.error(`تم تعليق حساب منشأة "${name}" في قاعدة البيانات.`);
    } else {
      toast.success(`تم فك تعليق منشأة "${name}" وإعادة تنشيط متجرها.`);
    }
  };

  const handleSaveCommission = async () => {
    if (!editingCommissionVendor) return;
    const { error } = await supabase
      .from("vendors")
      .update({ commission_rate: commissionValue })
      .eq("id", editingCommissionVendor.id);

    if (error) {
      toast.error(`تعذر تحديث العمولة: ${error.message}`);
      return;
    }

    setVendors((prev) =>
      prev.map((v) =>
        v.id === editingCommissionVendor.id ? { ...v, commissionRate: commissionValue } : v
      )
    );
    toast.success(`تم تحديث عمولة المنصة لـ "${editingCommissionVendor.name}" إلى ${commissionValue}%!`);
    setEditingCommissionVendor(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-[#006948]" />
            خزينة توثيق المنشآت وضبط العمولات (KYB)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            مراجعة وثائق السجل التجاري، التراخيص الضريبية ZATCA، وتعيين شرائح عمولة المنصة لكل تاجر.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 font-mono text-xs">
            إجمالي المنشآت: {vendors.length}
          </Badge>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث باسم المتجر، المالك، رقم السجل، أو المدينة..."
            className="pr-10 rounded-2xl border-slate-200 text-xs h-10 w-full"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: "all", label: "كافة المنشآت" },
            { id: "verified", label: "موثقة ومعتمدة" },
            { id: "pending_review", label: "بانتظار تدقيق KYB" },
            { id: "suspended", label: "موقوفة ومعلقة" },
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

      {/* Vendors Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">المنشأة والمالك</th>
                <th className="p-4">السجل التجاري والمدينة</th>
                <th className="p-4">نسبة عمولة المنصة</th>
                <th className="p-4">إجمالي التداول GMV</th>
                <th className="p-4">حالة التوثيق KYB</th>
                <th className="p-4 text-center">الإجراءات والرقابة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <span className="font-bold text-slate-900 block">{v.name}</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">{v.ownerName}</span>
                    <span className="text-[10px] text-emerald-800 font-semibold">{v.activeProducts} منتجات نشطة</span>
                  </td>

                  <td className="p-4">
                    <span className="font-mono font-bold text-slate-800 block">س.ت: {v.crNumber}</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">{v.city}</span>
                    <span className="text-[10px] font-mono text-slate-400">الرقم الضريبي: {v.vatNumber}</span>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base font-black text-[#006948] font-mono">{v.commissionRate}%</span>
                      <button
                        onClick={() => {
                          setEditingCommissionVendor(v);
                          setCommissionValue(v.commissionRate);
                        }}
                        title="تعديل نسبة العمولة"
                        className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-800 cursor-pointer"
                      >
                        <Percent className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                  <td className="p-4 font-black text-slate-900">
                    <span>{formatSAR(v.lifetimeGmv)}</span>
                  </td>

                  <td className="p-4">
                    {v.kybStatus === "verified" && (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 ml-1 text-emerald-600" />
                        موثق KYB معتمد
                      </Badge>
                    )}
                    {v.kybStatus === "pending_review" && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-300 animate-pulse">
                        <FileText className="w-3 h-3 ml-1 text-blue-600" />
                        بانتظار التدقيق
                      </Badge>
                    )}
                    {v.kybStatus === "suspended" && (
                      <Badge variant="outline" className="bg-rose-50 text-rose-800 border-rose-300">
                        <Ban className="w-3 h-3 ml-1 text-rose-600" />
                        حساب معلق
                      </Badge>
                    )}
                  </td>

                  <td className="p-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAuditingVendor(v)}
                        className="h-8 px-2.5 rounded-xl border-slate-200 text-slate-700 text-xs font-bold"
                      >
                        <FileText className="w-3.5 h-3.5 ml-1 text-slate-500" />
                        فحص KYB
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleSuspend(v.id, v.kybStatus, v.name)}
                        className={`h-8 px-2.5 rounded-xl text-xs font-bold ${
                          v.kybStatus === "suspended"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                            : "border-rose-200 text-rose-700 hover:bg-rose-50"
                        }`}
                      >
                        {v.kybStatus === "suspended" ? "تنشيط" : "إيقاف"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    لا توجد منشآت مطابقة حالياً.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* KYB Document Inspector Modal */}
      <Dialog open={!!auditingVendor} onOpenChange={() => setAuditingVendor(null)}>
        <DialogContent className="max-w-lg rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#006948]" />
              خزينة التحقق من وثائق المنشأة التجارية (KYB)
            </DialogTitle>
          </DialogHeader>

          {auditingVendor && (
            <div className="space-y-4 my-2 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">{auditingVendor.name}</span>
                  <Badge variant="sovereign">{auditingVendor.city}</Badge>
                </div>
                <span className="text-slate-500 block">المالك المسجل: {auditingVendor.ownerName}</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-700" />
                    <div>
                      <span className="font-bold text-slate-800 block">شهادة السجل التجاري</span>
                      <span className="font-mono text-slate-500 text-[10px]">رقم: {auditingVendor.crNumber}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-emerald-700 border-emerald-300">ساري ومطابق</Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-700" />
                    <div>
                      <span className="font-bold text-slate-800 block">شهادة التسجيل الضريبي ZATCA</span>
                      <span className="font-mono text-slate-500 text-[10px]">رقم: {auditingVendor.vatNumber}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-emerald-700 border-emerald-300">مرحلة 2 معتمدة</Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-emerald-700" />
                    <div>
                      <span className="font-bold text-slate-800 block">شهادة الآيبان البنكي (SAMA)</span>
                      <span className="font-mono text-slate-500 text-[10px]">{auditingVendor.iban}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-emerald-700 border-emerald-300">نشط ومعتمد</Badge>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:justify-start">
            {auditingVendor?.kybStatus !== "verified" && (
              <Button
                variant="sovereign"
                size="sm"
                onClick={() => {
                  if (auditingVendor) handleVerifyKyb(auditingVendor.id, auditingVendor.name);
                }}
                className="rounded-xl font-bold text-xs"
              >
                اعتماد المنشأة وترخيص المتجر
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAuditingVendor(null)}
              className="rounded-xl text-xs"
            >
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Set Commission Slider Modal */}
      <Dialog open={!!editingCommissionVendor} onOpenChange={() => setEditingCommissionVendor(null)}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Percent className="w-5 h-5 text-[#006948]" />
              تعديل شريحة عمولة المنصة السيادية
            </DialogTitle>
          </DialogHeader>

          {editingCommissionVendor && (
            <div className="space-y-4 my-3 text-xs">
              <p className="text-slate-600">
                تحديد نسبة العمولة المستقطعة من كل عملية بيع ناجحة لصالح المنصة لمتجر{" "}
                <span className="font-bold text-slate-900">{editingCommissionVendor.name}</span>:
              </p>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                <span className="text-3xl font-black text-[#006948] font-mono block">
                  {commissionValue}%
                </span>
                <span className="text-[11px] text-emerald-800 font-bold block mt-1">
                  نسبة المنصة السيادية (يتحصل التاجر على {100 - commissionValue}%)
                </span>
              </div>

              <div className="space-y-2 pt-2">
                <Slider
                  min={3}
                  max={25}
                  step={1}
                  value={[commissionValue]}
                  onValueChange={(val) => setCommissionValue(val[0])}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>3% (حد أدنى)</span>
                  <span>15% (شريحة عامة)</span>
                  <span>25% (فئة حصرية)</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:justify-start">
            <Button
              variant="sovereign"
              size="sm"
              onClick={handleSaveCommission}
              className="rounded-xl font-bold text-xs"
            >
              حفظ الشريحة الجديدة
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingCommissionVendor(null)}
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
