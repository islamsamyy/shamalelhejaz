"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import VendorNav from "@/components/vendor/VendorNav";
import StorefrontFooter from "@/components/StorefrontFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Store, ShieldCheck, Clock, Truck, ChevronLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function VendorStoreSettingsPage() {
  const [vendorId, setVendorId] = useState("modern-tech");
  const [storeName, setStoreName] = useState("شركة آفاق التقنية للتجارة");
  const [bio, setBio] = useState("الموزع المعتمد لأحدث الأجهزة الذكية والإلكترونيات الأصلية بالمملكة.");
  const [operatingHours, setOperatingHours] = useState("٩:٠٠ ص - ١١:٠٠ م (طوال أيام الأسبوع)");
  const [location, setLocation] = useState("الرياض • المملكة العربية السعودية");
  const [iban, setIban] = useState("SA4210000001234567890123");
  const [expressDeliveryActive, setExpressDeliveryActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadVendor() {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

      if (user) {
        const { data: v } = await supabase
          .from("vendors")
          .select("*")
          .eq("owner_id", user.id)
          .maybeSingle();

        if (v) {
          setVendorId(v.id);
          if (v.name) setStoreName(v.name);
          if (v.bio) setBio(v.bio);
          if (v.location) setLocation(v.location);
          if (v.iban) setIban(v.iban);
          return;
        }
      }

      const { data: anyV } = await supabase.from("vendors").select("*").limit(1).maybeSingle();
      if (anyV) {
        setVendorId(anyV.id);
        if (anyV.name) setStoreName(anyV.name);
        if (anyV.bio) setBio(anyV.bio);
        if (anyV.location) setLocation(anyV.location);
        if (anyV.iban) setIban(anyV.iban);
      }
    }
    loadVendor();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("vendors")
        .update({
          name: storeName.trim(),
          bio: bio.trim(),
          location: location.trim(),
          iban: iban.trim(),
        })
        .eq("id", vendorId);

      if (error) {
        toast.error("فشل حفظ التعديلات: " + error.message);
        return;
      }
      toast.success("تم حفظ وتحديث إعدادات المتجر في Supabase بنجاح!");
    } catch (err: any) {
      toast.error("خطأ: " + err?.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col">
      <VendorNav />

      <main className="flex-1">
        <section className="bg-white border-b border-slate-200/80 py-8">
          <div className="max-w-[1000px] mx-auto px-4 lg:px-8">
            <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2">
              <Link href="/vendor" className="hover:text-[#006948] transition-colors">بوابة التجار</Link>
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="text-[#006948] font-bold">إعدادات المتجر وهوية العلامة</span>
            </nav>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#006948] flex items-center justify-center font-bold">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900">
                  إعدادات المتجر وسياسات العمل
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  تعديل ملف العلامة، أوقات العمل، وسياسات التوصيل الفوري VIP.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-[1000px] mx-auto px-4 lg:px-8 py-8">
          <form onSubmit={handleSave} className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-md space-y-6">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">اسم المتجر الرسمي في المنصة</label>
              <Input
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">النبذة الرسمية للعلامة</label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="h-24"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">ساعات العمل واستقبال الطلبات</label>
              <Input
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-800">سياسات الشحن الخاصة</h4>
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900">تفعيل التوصيل الفوري خلال ساعتين (VIP)</span>
                  <span className="text-[11px] text-slate-500">يتطلب تجهيز الشحنة في المستودع خلال ٣٠ دقيقة من استلام الطلب</span>
                </div>
                <input
                  type="checkbox"
                  checked={expressDeliveryActive}
                  onChange={(e) => setExpressDeliveryActive(e.target.checked)}
                  className="w-4 h-4 accent-[#006948]"
                />
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button asChild variant="outline">
                <Link href="/vendor">الرجوع</Link>
              </Button>
              <Button type="submit" variant="sovereign" size="lg" className="font-bold">
                حفظ التعديلات
              </Button>
            </div>
          </form>
        </section>
      </main>

      <StorefrontFooter />
    </div>
  );
}

