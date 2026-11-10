"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
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
  XCircle,
  FileText,
  Percent,
  AlertTriangle,
  Building,
  ShieldCheck,
  Ban,
  ExternalLink,
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
  commissionRate: number; // e.g. 8%
  lifetimeGmv: number;
  activeProducts: number;
  kybStatus: "verified" | "pending_review" | "suspended";
}

const mockVendors: VendorRecord[] = [
  {
    id: "VND-101",
    name: "دار الصائغ الملكية للمقتنيات",
    ownerName: "الشيخ عبدالعزيز الصائغ",
    crNumber: "1010482910",
    vatNumber: "310029384910003",
    iban: "SA4480000201608010192841",
    city: "الرياض",
    commissionRate: 8,
    lifetimeGmv: 18450000,
    activeProducts: 24,
    kybStatus: "verified",
  },
  {
    id: "VND-102",
    name: "مشالح الأحساء التاريخية",
    ownerName: "الحاج إبراهيم بو حليقة",
    crNumber: "2251029481",
    vatNumber: "300182940192831",
    iban: "SA0380000192847291029381",
    city: "الأحساء • الهفوف",
    commissionRate: 9,
    lifetimeGmv: 9240000,
    activeProducts: 18,
    kybStatus: "verified",
  },
  {
    id: "VND-103",
    name: "صاغة الجنوب والمشغولات الفضية",
    ownerName: "صالح بن علي الغامدي",
    crNumber: "5900018291",
    vatNumber: "310293849102938",
    iban: "SA9280000192847291029382",
    city: "نجران",
    commissionRate: 7,
    lifetimeGmv: 4210000,
    activeProducts: 12,
    kybStatus: "pending_review",
  },
  {
    id: "VND-104",
    name: "بيت العود المعتق والمقطرات",
    ownerName: "خالد بن فهد الدوسري",
    crNumber: "1010394821",
    vatNumber: "300928374819203",
    iban: "SA1180000192847291029383",
    city: "الرياض",
    commissionRate: 10,
    lifetimeGmv: 6890000,
    activeProducts: 31,
    kybStatus: "verified",
  },
  {
    id: "VND-105",
    name: "مرابط الصافنات للوازم الفروسية",
    ownerName: "محمد بن سلطان القحطاني",
    crNumber: "5850029182",
    vatNumber: "310029384910005",
    iban: "SA5580000192847291029384",
    city: "الدرعية",
    commissionRate: 8,
    lifetimeGmv: 3400000,
    activeProducts: 15,
    kybStatus: "pending_review",
  },
  {
    id: "VND-106",
    name: "مجوهرات اليمامة القديمة",
    ownerName: "تركي بن سعد العتيبي",
    crNumber: "1010294822",
    vatNumber: "300192847192834",
    iban: "SA7780000192847291029385",
    city: "الرياض",
    commissionRate: 12,
    lifetimeGmv: 1280000,
    activeProducts: 9,
    kybStatus: "suspended",
  },
];

export default function VendorManagementPage() {
  const [vendors, setVendors] = useState<VendorRecord[]>(mockVendors);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Dialog states
  const [auditingVendor, setAuditingVendor] = useState<VendorRecord | null>(null);
  const [editingCommissionVendor, setEditingCommissionVendor] = useState<VendorRecord | null>(null);
  const [commissionValue, setCommissionValue] = useState<number>(8);

  const filtered = vendors.filter((v) => {
    const matchesStatus = filterStatus === "all" || v.kybStatus === filterStatus;
    const matchesSearch =
      v.name.includes(search) ||
      v.ownerName.includes(search) ||
      v.crNumber.includes(search) ||
      v.city.includes(search);
    return matchesStatus && matchesSearch;
  });

  const handleVerifyKyb = (id: string, name: string) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, kybStatus: "verified" } : v))
    );
    toast.success(`تم اعتماد توثيق المنشأة KYB لـ "${name}" وتفعيل حساب البائع!`);
    setAuditingVendor(null);
  };

  const handleToggleSuspend = (id: string, currentStatus: string, name: string) => {
    const nextStatus = currentStatus === "suspended" ? "verified" : "suspended";
    setVendors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, kybStatus: nextStatus } : v))
    );
    if (nextStatus === "suspended") {
      toast.error(`تم تعليق حساب منشأة "${name}" وإخفاء منتجاتها مؤقتاً.`);
    } else {
      toast.success(`تم فك تعليق منشأة "${name}" وإعادة تنشيط متجرها.`);
    }
  };

  const handleSaveCommission = () => {
    if (!editingCommissionVendor) return;
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
            الربط مع وزارة التجارة: نشط
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
            {auditingVendor?.kybStatus === "pending_review" && (
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

