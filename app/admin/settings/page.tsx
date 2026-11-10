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
  Settings,
  CreditCard,
  Truck,
  ShieldCheck,
  UserCheck,
  PlusCircle,
  CheckCircle2,
  Lock,
  Key,
} from "lucide-react";
import { toast } from "sonner";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: "Super Admin" | "Catalog Moderator" | "Finance Officer" | "Support Agent";
  active: boolean;
}

const initialStaff: StaffMember[] = [
  { id: "STF-01", name: "المهندس إسلام محمد", email: "eslam@souq.sa", role: "Super Admin", active: true },
  { id: "STF-02", name: "سلطان الراشد", email: "sultan.r@souq.sa", role: "Catalog Moderator", active: true },
  { id: "STF-03", name: "نورة القحطاني", email: "noura.q@souq.sa", role: "Finance Officer", active: true },
  { id: "STF-04", name: "خالد التميمي", email: "khaled.t@souq.sa", role: "Support Agent", active: true },
];

export default function SystemSettingsPage() {
  // Gateways State
  const [gateways, setGateways] = useState({
    mada: true,
    applePay: true,
    tamara: true,
    tabby: true,
    cod: false,
  });

  // Carriers State
  const [carriers, setCarriers] = useState({
    spl: true,
    smsa: true,
    dhl: false,
  });

  // Staff State
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffRole, setNewStaffRole] = useState<StaffMember["role"]>("Catalog Moderator");

  const toggleGateway = (key: keyof typeof gateways) => {
    setGateways((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      toast.info(`تم تحديث حالة بوابة الدفع (${key}): ${updated[key] ? "مفعلة" : "معطلة"}`);
      return updated;
    });
  };

  const toggleCarrier = (key: keyof typeof carriers) => {
    setCarriers((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      toast.info(`تم تحديث ربط شركة الشحن (${key}): ${updated[key] ? "مفعلة" : "معطلة"}`);
      return updated;
    });
  };

  const handleAddStaff = () => {
    if (!newStaffName.trim() || !newStaffEmail.trim()) {
      toast.error("يرجى ملء الاسم والبريد الإلكتروني للموظف");
      return;
    }
    const newMember: StaffMember = {
      id: `STF-${Date.now()}`,
      name: newStaffName,
      email: newStaffEmail,
      role: newStaffRole,
      active: true,
    };
    setStaff((prev) => [...prev, newMember]);
    toast.success(`تمت إضافة المشرف "${newStaffName}" بصلاحية ${newStaffRole}!`);
    setIsAddStaffOpen(false);
    setNewStaffName("");
    setNewStaffEmail("");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Settings className="w-7 h-7 text-[#006948]" />
            إعدادات المنظومة وصلاحيات الفريق (RBAC)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            إدارة بوابات الدفع الوطنية، مفاتيح الربط اللوجستي، وتوزيع الصلاحيات الإدارية لفريق العمل.
          </p>
        </div>

        <Button
          variant="sovereign"
          size="sm"
          onClick={() => toast.success("تم التحقق من كافة المفاتيح البرمجية ومزامنة الربط بنجاح!")}
          className="rounded-xl font-bold text-xs"
        >
          <ShieldCheck className="w-4 h-4 ml-1.5" />
          فحص سلامة الربط API
        </Button>
      </div>

      {/* Payment Gateways Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <CreditCard className="w-5 h-5 text-[#006948]" />
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              بوابات الدفع الإلكتروني والتقسيط المعتمدة
            </h3>
            <p className="text-xs text-slate-500">
              تفعيل أو تعطيل طرق الدفع اللحظية للعملاء في واجهة المتجر.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { id: "mada", name: "شبكة مدى السعودية (Mada)", desc: "البطاقات البنكية المحلية", active: gateways.mada },
            { id: "applePay", name: "Apple Pay (الدفع السريع)", desc: "الأجهزة المتوافقة مع سفاري وiOS", active: gateways.applePay },
            { id: "tamara", name: "تمارا (Tamara BNPL)", desc: "تقسيط ميسر متوافق مع الشريعة", active: gateways.tamara },
            { id: "tabby", name: "تابي (Tabby 4 Payments)", desc: "الدفع على 4 دفعات شهرية", active: gateways.tabby },
            { id: "cod", name: "الدفع عند الاستلام (COD)", desc: "للمقتنيات المحددة فقط", active: gateways.cod },
          ].map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-slate-800 block text-xs">{item.name}</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">{item.desc}</span>
              </div>
              <Button
                variant={item.active ? "sovereign" : "outline"}
                size="sm"
                onClick={() => toggleGateway(item.id as keyof typeof gateways)}
                className="rounded-xl text-xs font-bold h-8"
              >
                {item.active ? "مفعل" : "معطل"}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Logistics & Shipping Carriers Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <Truck className="w-5 h-5 text-[#006948]" />
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              الربط اللوجستي مع شركات الشحن السريع
            </h3>
            <p className="text-xs text-slate-500">
              توليد بوالص الشحن الإلكترونية والتتبع التلقائي لمسار الشحنات.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { id: "spl", name: "سبل البريد السعودي (SPL Express)", badge: "الناقل الوطني الرسمي", active: carriers.spl },
            { id: "smsa", name: "سمسا إكسبريس (SMSA Express)", badge: "توصيل خلال ٢٤ ساعة", active: carriers.smsa },
            { id: "dhl", name: "دي إتش إل إكسبريس (DHL International)", badge: "للشحن الدبلوماسي والدولي", active: carriers.dhl },
          ].map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-slate-800 block text-xs">{item.name}</span>
                <Badge variant="outline" className="text-[10px] mt-1 text-slate-500">{item.badge}</Badge>
              </div>
              <Button
                variant={item.active ? "sovereign" : "outline"}
                size="sm"
                onClick={() => toggleCarrier(item.id as keyof typeof carriers)}
                className="rounded-xl text-xs font-bold h-8"
              >
                {item.active ? "متصل" : "معطل"}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Staff & Role-Based Access Control (RBAC) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <UserCheck className="w-5 h-5 text-[#006948]" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                صلاحيات المشرفين والموظفين (RBAC Matrix)
              </h3>
              <p className="text-xs text-slate-500">
                تعيين الأدوار الرقابية والمالية والتنفيذية لطاقم إدارة المنصة.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddStaffOpen(true)}
            className="rounded-xl text-xs font-bold"
          >
            <PlusCircle className="w-3.5 h-3.5 ml-1.5" />
            إضافة مشرف جديد
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">اسم المشرف</th>
                <th className="p-3">البريد الإلكتروني</th>
                <th className="p-3">الدور والصلاحية</th>
                <th className="p-3">حالة الحساب</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staff.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/80">
                  <td className="p-3 font-bold text-slate-900">{member.name}</td>
                  <td className="p-3 font-mono text-slate-600">{member.email}</td>
                  <td className="p-3">
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 font-bold">
                      {member.role}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      نشط ومصرح
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-[#006948]" />
              إضافة مشرف جديد لمنظومة الرقابة
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 my-2 text-xs">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                اسم المشرف:
              </label>
              <Input
                value={newStaffName}
                onChange={(e) => setNewStaffName(e.target.value)}
                placeholder="مثال: عبدالله السبيعي"
                className="rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                البريد الإلكتروني المؤسسي:
              </label>
              <Input
                type="email"
                value={newStaffEmail}
                onChange={(e) => setNewStaffEmail(e.target.value)}
                placeholder="name@souq.sa"
                className="rounded-xl text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                الدور والصلاحية (Role):
              </label>
              <select
                value={newStaffRole}
                onChange={(e) => setNewStaffRole(e.target.value as StaffMember["role"])}
                className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none"
              >
                <option value="Super Admin">Super Admin (صلاحيات كاملة غير مقيدة)</option>
                <option value="Catalog Moderator">Catalog Moderator (تدقيق واعتماد الكتالوج)</option>
                <option value="Finance Officer">Finance Officer (التسويات الضريبية والضمان)</option>
                <option value="Support Agent">Support Agent (عناية العملاء والنزاعات)</option>
              </select>
            </div>
          </div>

          <DialogFooter className="flex gap-2 sm:justify-start">
            <Button
              variant="sovereign"
              size="sm"
              onClick={handleAddStaff}
              className="rounded-xl font-bold text-xs"
            >
              تأكيد الصلاحية وإرسال الدعوة
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddStaffOpen(false)}
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

