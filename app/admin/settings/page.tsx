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
  Settings,
  CreditCard,
  Truck,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  Sliders,
} from "lucide-react";
import { toast } from "sonner";

interface GatewayRow {
  code: string;
  name: string;
  enabled: boolean;
  mode: "sandbox" | "live";
  public_config: Record<string, any>;
  sort_order: number;
}

interface ProfileRow {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "vendor" | "customer";
}

export default function SystemSettingsPage() {
  const [gateways, setGateways] = useState<GatewayRow[]>([]);
  const [carriers, setCarriers] = useState<{ spl: boolean; smsa: boolean; dhl: boolean }>({
    spl: true,
    smsa: true,
    dhl: false,
  });
  const [platformSettings, setPlatformSettings] = useState({
    vatRate: 0.15,
    freeShippingThreshold: 200,
    shippingFlat: 25,
  });
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [editingGateway, setEditingGateway] = useState<GatewayRow | null>(null);
  const [gatewayPublicKey, setGatewayPublicKey] = useState("");
  const [gatewayMode, setGatewayMode] = useState<"sandbox" | "live">("sandbox");

  const loadSettings = useCallback(async () => {
    const [gwRes, setRes, profRes] = await Promise.all([
      supabase.from("payment_gateways").select("*").order("sort_order", { ascending: true }),
      supabase.from("app_settings").select("*"),
      supabase.from("profiles").select("id, email, full_name, role").order("created_at", { ascending: true }),
    ]);

    if (gwRes.data) {
      setGateways(gwRes.data as GatewayRow[]);
    }

    if (setRes.data) {
      const map = new Map(setRes.data.map((r: any) => [r.key, r.value]));
      if (map.has("carriers") && typeof map.get("carriers") === "object") {
        setCarriers(map.get("carriers") as any);
      }
      setPlatformSettings({
        vatRate: Number(map.get("vat_rate") ?? 0.15),
        freeShippingThreshold: Number(map.get("free_shipping_threshold") ?? 200),
        shippingFlat: Number(map.get("shipping_flat") ?? 25),
      });
    }

    if (profRes.data) {
      setProfiles(profRes.data as ProfileRow[]);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const toggleGateway = async (gw: GatewayRow) => {
    const nextEnabled = !gw.enabled;
    const { error } = await supabase
      .from("payment_gateways")
      .update({ enabled: nextEnabled, updated_at: new Date().toISOString() })
      .eq("code", gw.code);

    if (error) {
      toast.error(`تعذر تحديث بوابة الدفع: ${error.message}`);
      return;
    }

    setGateways((prev) =>
      prev.map((item) => (item.code === gw.code ? { ...item, enabled: nextEnabled } : item))
    );
    toast.info(`تم تحديث حالة بوابة الدفع (${gw.name}): ${nextEnabled ? "مفعلة" : "معطلة"}`);
  };

  const handleSaveGatewayConfig = async () => {
    if (!editingGateway) return;
    const nextConfig = {
      ...(editingGateway.public_config || {}),
      publishable_key: gatewayPublicKey.trim(),
    };
    const { error } = await supabase
      .from("payment_gateways")
      .update({
        mode: gatewayMode,
        public_config: nextConfig,
        updated_at: new Date().toISOString(),
      })
      .eq("code", editingGateway.code);

    if (error) {
      toast.error(`تعذر حفظ إعدادات البوابة: ${error.message}`);
      return;
    }

    setGateways((prev) =>
      prev.map((g) =>
        g.code === editingGateway.code ? { ...g, mode: gatewayMode, public_config: nextConfig } : g
      )
    );
    toast.success(`تم حفظ إعدادات بوابة "${editingGateway.name}" في قاعدة البيانات!`);
    setEditingGateway(null);
  };

  const toggleCarrier = async (key: keyof typeof carriers) => {
    const updated = { ...carriers, [key]: !carriers[key] };
    const { error } = await supabase.from("app_settings").upsert({
      key: "carriers",
      value: updated,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      toast.error(`تعذر تحديث إعدادات الشحن: ${error.message}`);
      return;
    }

    setCarriers(updated);
    toast.info(`تم تحديث ربط شركة الشحن (${key.toUpperCase()}): ${updated[key] ? "مفعلة" : "معطلة"}`);
  };

  const handleSavePlatformSettings = async () => {
    const rows = [
      { key: "vat_rate", value: platformSettings.vatRate, updated_at: new Date().toISOString() },
      {
        key: "free_shipping_threshold",
        value: platformSettings.freeShippingThreshold,
        updated_at: new Date().toISOString(),
      },
      { key: "shipping_flat", value: platformSettings.shippingFlat, updated_at: new Date().toISOString() },
    ];
    const { error } = await supabase.from("app_settings").upsert(rows);
    if (error) {
      toast.error(`تعذر حفظ الإعدادات: ${error.message}`);
      return;
    }
    toast.success("تم حفظ إعدادات الضريبة والشحن في جدول app_settings بنجاح!");
  };

  const handleChangeUserRole = async (profile: ProfileRow, nextRole: ProfileRow["role"]) => {
    const { error } = await supabase
      .from("profiles")
      .update({ role: nextRole })
      .eq("id", profile.id);

    if (error) {
      toast.error(`تعذر تغيير الصلاحية: ${error.message}`);
      return;
    }

    setProfiles((prev) =>
      prev.map((p) => (p.id === profile.id ? { ...p, role: nextRole } : p))
    );
    toast.success(`تم تحديث صلاحية "${profile.email}" إلى (${nextRole}) في قاعدة البيانات!`);
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
            تحكم مباشر في جداول `payment_gateways` و `app_settings` و `profiles.role` داخل Supabase.
          </p>
        </div>

        <Button
          variant="sovereign"
          size="sm"
          onClick={loadSettings}
          className="rounded-xl font-bold text-xs"
        >
          <ShieldCheck className="w-4 h-4 ml-1.5" />
          مزامنة الإعدادات من قاعدة البيانات
        </Button>
      </div>

      {/* Payment Gateways Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <CreditCard className="w-5 h-5 text-[#006948]" />
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              بوابات الدفع الإلكتروني (`public.payment_gateways`)
            </h3>
            <p className="text-xs text-slate-500">
              تفعيل أو تعطيل طرق الدفع وضبط وضع التجربة (Sandbox / Live) والمفاتيح العامة.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {gateways.map((gw) => (
            <div
              key={gw.code}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-bold text-slate-800 block text-xs">{gw.name}</span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase block mt-0.5">
                    code: {gw.code} • mode: {gw.mode}
                  </span>
                </div>
                <Badge variant={gw.enabled ? "sovereign" : "outline"} className="text-[10px]">
                  {gw.enabled ? "مفعل" : "معطل"}
                </Badge>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                <Button
                  variant={gw.enabled ? "outline" : "sovereign"}
                  size="sm"
                  onClick={() => toggleGateway(gw)}
                  className="rounded-xl text-xs font-bold h-8 flex-1"
                >
                  {gw.enabled ? "تعطيل" : "تفعيل"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingGateway(gw);
                    setGatewayMode(gw.mode);
                    setGatewayPublicKey(gw.public_config?.publishable_key || "");
                  }}
                  className="rounded-xl text-xs h-8"
                >
                  ضبط المفاتيح
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Tax & Shipping Rules */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Sliders className="w-5 h-5 text-[#006948]" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                قواعد الضريبة والشحن (`public.app_settings`)
              </h3>
              <p className="text-xs text-slate-500">
                تُستخدم تلقائياً داخل دالة إنشاء الطلب الآمنة `create_order_secure`.
              </p>
            </div>
          </div>

          <Button
            variant="sovereign"
            size="sm"
            onClick={handleSavePlatformSettings}
            className="rounded-xl text-xs font-bold"
          >
            حفظ قواعد التسعير
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">نسبة ضريبة القيمة المضافة (مثلاً 0.15):</label>
            <Input
              type="number"
              step="0.01"
              value={platformSettings.vatRate}
              onChange={(e) => setPlatformSettings({ ...platformSettings, vatRate: Number(e.target.value) })}
              className="rounded-xl font-mono"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">حد الشحن المجاني (ر.س):</label>
            <Input
              type="number"
              value={platformSettings.freeShippingThreshold}
              onChange={(e) =>
                setPlatformSettings({ ...platformSettings, freeShippingThreshold: Number(e.target.value) })
              }
              className="rounded-xl font-mono"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">رسوم الشحن الثابتة (ر.س):</label>
            <Input
              type="number"
              value={platformSettings.shippingFlat}
              onChange={(e) => setPlatformSettings({ ...platformSettings, shippingFlat: Number(e.target.value) })}
              className="rounded-xl font-mono"
            />
          </div>
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
                صلاحيات المستخدمين والمشرفين (`public.profiles`)
              </h3>
              <p className="text-xs text-slate-500">
                تعديل الدور (`admin` / `vendor` / `customer`) لأي مستخدم مسجل محمي بـ Trigger قاعدة البيانات.
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">الاسم الكامل</th>
                <th className="p-3">البريد الإلكتروني</th>
                <th className="p-3">الدور الحالي</th>
                <th className="p-3">تغيير الصلاحية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {profiles.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/80">
                  <td className="p-3 font-bold text-slate-900">{member.full_name || "—"}</td>
                  <td className="p-3 font-mono text-slate-600">{member.email}</td>
                  <td className="p-3">
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 font-bold">
                      {member.role}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <select
                      value={member.role}
                      onChange={(e) => handleChangeUserRole(member, e.target.value as ProfileRow["role"])}
                      className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold"
                    >
                      <option value="customer">customer (عميل)</option>
                      <option value="vendor">vendor (تاجر)</option>
                      <option value="admin">admin (مشرف عام)</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Gateway Modal */}
      <Dialog open={!!editingGateway} onOpenChange={() => setEditingGateway(null)}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#006948]" />
              ضبط إعدادات بوابة {editingGateway?.name}
            </DialogTitle>
          </DialogHeader>

          {editingGateway && (
            <div className="space-y-4 my-2 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">بيئة التشغيل (Mode):</label>
                <select
                  value={gatewayMode}
                  onChange={(e) => setGatewayMode(e.target.value as "sandbox" | "live")}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold"
                >
                  <option value="sandbox">Sandbox (بيئة الاختبار التجريبية)</option>
                  <option value="live">Live (بيئة الإنتاج الفعلية)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  المفتاح العام (Publishable / Public Key):
                </label>
                <Input
                  value={gatewayPublicKey}
                  onChange={(e) => setGatewayPublicKey(e.target.value)}
                  placeholder="pk_test_..."
                  dir="ltr"
                  className="rounded-xl font-mono text-xs"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  المفاتيح السرية (Secret Keys) تُحفظ في متغيرات البيئة `.env.local` على الخادم فقط.
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:justify-start">
            <Button
              variant="sovereign"
              size="sm"
              onClick={handleSaveGatewayConfig}
              className="rounded-xl font-bold text-xs"
            >
              حفظ الإعدادات
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingGateway(null)}
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
