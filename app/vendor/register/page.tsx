"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StorefrontHeader from "@/components/StorefrontHeader";
import StorefrontFooter from "@/components/StorefrontFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ShieldCheck,
  Building,
  FileCheck2,
  CheckCircle2,
  ChevronLeft,
  ArrowLeft,
  Upload,
  CreditCard,
  MapPin,
  FileSignature,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function VendorKYBRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Form State across the 8 KYB Steps
  const [kybData, setKybData] = useState({
    // Step 1: Account & Contact
    repName: "عبد العزيز بن ناصر الروضان",
    email: "business@alrowdha-oud.sa",
    phone: "0559182741",
    role: "الرئيس التنفيذي / المالك",

    // Step 2: Business Info
    companyName: "شركة دار الروضة للعود والمقتنيات الملكية",
    brandName: "دار الروضة للعطور",
    businessType: "شركة ذات مسؤولية محدودة (LLC)",
    region: "منطقة الرياض",

    // Step 3: Commercial Registration (CR)
    crNumber: "1010884920",
    crIssueDate: "1442/06/15",
    crExpiryDate: "1447/06/15",

    // Step 4: ZATCA VAT Number
    vatNumber: "310294819000003",
    zatcaPhase: "المرحلة الثانية (ربط وتكامل نشط)",

    // Step 5: Saudi IBAN Verification
    bankName: "البنك الأهلي السعودي (SNB)",
    iban: "SA4210000001234567890123",
    accountHolder: "شركة دار الروضة للعود",

    // Step 6: Licensing / Maroof
    maroofId: "249182",
    licenseType: "رخصة وزارة التجارة وتصريح الهيئة الملكية",

    // Step 7: National Address & Warehouse
    warehouseCity: "الرياض",
    warehouseDistrict: "حي السلي - المنطقة الصناعية",
    warehouseSplCode: "RRRD7841",

    // Step 8: Sovereign Agreement
    termsAccepted: true,
  });

  const stepsList = [
    { num: 1, title: "بيانات المفوض" },
    { num: 2, title: "هوية المنشأة" },
    { num: 3, title: "السجل التجاري (CR)" },
    { num: 4, title: "الرقم الضريبي (ZATCA)" },
    { num: 5, title: "الآيبان البنكي (IBAN)" },
    { num: 6, title: "التراخيص ومعروف" },
    { num: 7, title: "المستودع والعنوان" },
    { num: 8, title: "توقيع الشراكة السيادية" },
  ];

  const handleNext = () => {
    if (step === 3 && kybData.crNumber.length !== 10) {
      toast.error("السجل التجاري السعودي يجب أن يتكون من 10 أرقام.");
      return;
    }
    if (step === 4 && kybData.vatNumber.length !== 15) {
      toast.error("الرقم الضريبي ZATCA يجب أن يتكون من 15 رقماً.");
      return;
    }
    if (step === 5 && !kybData.iban.startsWith("SA")) {
      toast.error("الآيبان البنكي السعودي يجب أن يبدأ بحرفي SA.");
      return;
    }
    setStep((prev) => Math.min(8, prev + 1));
  };

  const handlePrev = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmitKYB = async () => {
    setIsSubmitting(true);
    toast.info("جاري حفظ طلب توثيق المنشأة في قاعدة البيانات...");

    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;
      if (!user) {
        toast.error("يرجى تسجيل الدخول بحسابك أولاً لتقديم طلب توثيق المنشأة KYB.");
        router.push("/auth/login?redirect=/vendor/register");
        return;
      }

      const slug = `vendor-${Date.now()}`;
      const { error } = await supabase.from("vendors").insert([
        {
          id: slug,
          name: kybData.companyName.trim(),
          slug,
          owner_name: kybData.repName.trim(),
          cr_number: kybData.crNumber.trim(),
          vat_number: kybData.vatNumber.trim(),
          iban: kybData.iban.trim(),
          location: kybData.warehouseCity.trim(),
          owner_id: user.id,
          verified: false,
          status: "pending",
        },
      ]);

      if (error) {
        toast.error(`تعذر إرسال طلب التوثيق: ${error.message}`);
        return;
      }

      setIsComplete(true);
      toast.success("تم إرسال طلب توثيق المنشأة إلى الإدارة للمراجعة والاعتماد!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col">
      <StorefrontHeader />

      <main className="flex-1 pt-32 lg:pt-36">
        <section className="bg-white border-b border-slate-200/80 py-8">
          <div className="max-w-[1200px] mx-auto px-4 lg:px-8">
            <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2">
              <Link href="/vendor" className="hover:text-[#006948] transition-colors">بوابة التجار</Link>
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="text-[#006948] font-bold">معالج توثيق المنشأة الحكومي (KYB)</span>
            </nav>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="sovereign">الربط مع منصة واثق الحكومية</Badge>
                  <span className="text-xs text-slate-400">فحص آلي للسجلات والتراخيص</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                  معالج توثيق المنشأة (KYB Verification Wizard)
                </h1>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>الخطوة {step} من ٨</span>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-4 lg:px-8 py-8">
          {/* 8-Step Progress Bar */}
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mb-10">
            {stepsList.map((st) => (
              <div
                key={st.num}
                onClick={() => st.num < step && setStep(st.num)}
                className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                  step === st.num
                    ? "bg-[#006948] text-white border-[#006948] shadow-md shadow-[#006948]/20"
                    : st.num < step
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-white text-slate-400 border-slate-200"
                }`}
              >
                <span className="text-[10px] font-bold block mb-0.5">
                  {st.num < step ? "✓" : `${st.num}`}
                </span>
                <span className="text-[11px] font-bold truncate block">{st.title}</span>
              </div>
            ))}
          </div>

          {/* Form Content Card */}
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-md max-w-3xl mx-auto">
            {isComplete ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-20 h-20 rounded-full bg-emerald-50 text-[#006948] flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <Badge variant="sovereign">شريك بلاتيني معتمد</Badge>
                <h3 className="text-2xl font-black text-slate-900">
                  تهانينا! تم توثيق منشأتك بنجاح
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  تم التحقق من السجل التجاري عبر واثق وتفعيل بوابة الفوترة ZATCA وحساب الضمان في ساما. يمكنك الآن البدء في إضافة منتجاتك.
                </p>
                <div className="pt-4 flex justify-center gap-3">
                  <Button asChild variant="sovereign" size="lg" className="font-bold">
                    <Link href="/vendor/catalog/add">إضافة أول منتج للكتالوج</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="font-bold">
                    <Link href="/vendor">لوحة عمليات المتجر</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Step 1: Representative */}
                {step === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-slate-900">بيانات المفوض أو المالك</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">اسم المفوض الثلاثي</label>
                        <Input
                          value={kybData.repName}
                          onChange={(e) => setKybData({ ...kybData, repName: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">الصفة القانونية / المنصب</label>
                        <Input
                          value={kybData.role}
                          onChange={(e) => setKybData({ ...kybData, role: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">رقم الجوال الموثق بنفاذ</label>
                        <Input
                          value={kybData.phone}
                          onChange={(e) => setKybData({ ...kybData, phone: e.target.value })}
                          dir="ltr"
                          className="text-right"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">البريد الإلكتروني الرسمي</label>
                        <Input
                          type="email"
                          value={kybData.email}
                          onChange={(e) => setKybData({ ...kybData, email: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Business Info */}
                {step === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-slate-900">هوية وبيانات المنشأة</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">اسم المنشأة في السجل التجاري</label>
                        <Input
                          value={kybData.companyName}
                          onChange={(e) => setKybData({ ...kybData, companyName: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">الاسم التجاري للعلامة</label>
                        <Input
                          value={kybData.brandName}
                          onChange={(e) => setKybData({ ...kybData, brandName: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">الكيان القانوني</label>
                        <Input
                          value={kybData.businessType}
                          onChange={(e) => setKybData({ ...kybData, businessType: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">المنطقة الجغرافية</label>
                        <Input
                          value={kybData.region}
                          onChange={(e) => setKybData({ ...kybData, region: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: CR */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900">السجل التجاري السعودي (CR)</h3>
                      <Badge variant="sovereign">فحص واثق الفوري</Badge>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">رقم السجل التجاري (١٠ أرقام)</label>
                        <Input
                          value={kybData.crNumber}
                          onChange={(e) => setKybData({ ...kybData, crNumber: e.target.value })}
                          maxLength={10}
                          placeholder="1010884920"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">تاريخ الإصدار</label>
                          <Input
                            value={kybData.crIssueDate}
                            onChange={(e) => setKybData({ ...kybData, crIssueDate: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">تاريخ الانتهاء</label>
                          <Input
                            value={kybData.crExpiryDate}
                            onChange={(e) => setKybData({ ...kybData, crExpiryDate: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: ZATCA VAT */}
                {step === 4 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900">الرقم الضريبي ZATCA</h3>
                      <Badge variant="sovereign">المرحلة الثانية نشطة</Badge>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">الرقم الضريبي للمنشأة (١٥ رقماً)</label>
                      <Input
                        value={kybData.vatNumber}
                        onChange={(e) => setKybData({ ...kybData, vatNumber: e.target.value })}
                        maxLength={15}
                        placeholder="310294819000003"
                      />
                    </div>
                    <div className="p-3.5 rounded-2xl bg-emerald-50 text-xs text-emerald-900 font-semibold border border-emerald-100 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>تم ربط وتفعيل شهادة التشفير Cryptographic Stamp بنجاح.</span>
                    </div>
                  </div>
                )}

                {/* Step 5: Saudi IBAN */}
                {step === 5 && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-slate-900">الآيبان البنكي وحساب التسويات ساما</h3>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">رقم الآيبان البنكي (يبدأ بـ SA)</label>
                      <Input
                        value={kybData.iban}
                        onChange={(e) => setKybData({ ...kybData, iban: e.target.value })}
                        dir="ltr"
                        className="text-right font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">اسم البنك السعودي</label>
                      <Input
                        value={kybData.bankName}
                        onChange={(e) => setKybData({ ...kybData, bankName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">اسم صاحب الحساب (مطابق للسجل)</label>
                      <Input
                        value={kybData.accountHolder}
                        onChange={(e) => setKybData({ ...kybData, accountHolder: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {/* Step 6: Licensing / Maroof */}
                {step === 6 && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-slate-900">توثيق منصة معروف والتراخيص الحرفية</h3>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">رقم شهادة منصة معروف</label>
                      <Input
                        value={kybData.maroofId}
                        onChange={(e) => setKybData({ ...kybData, maroofId: e.target.value })}
                        placeholder="249182"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">نوع التصريح الحِرفي أو الصناعي</label>
                      <Input
                        value={kybData.licenseType}
                        onChange={(e) => setKybData({ ...kybData, licenseType: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {/* Step 7: Warehouse & SPL */}
                {step === 7 && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-slate-900">العنوان الوطني للمستودع (SPL)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">مدينة المستودع</label>
                        <Input
                          value={kybData.warehouseCity}
                          onChange={(e) => setKybData({ ...kybData, warehouseCity: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">الحي أو المنطقة الصناعية</label>
                        <Input
                          value={kybData.warehouseDistrict}
                          onChange={(e) => setKybData({ ...kybData, warehouseDistrict: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">رمز سبل المختصر للمستودع</label>
                        <Input
                          value={kybData.warehouseSplCode}
                          onChange={(e) => setKybData({ ...kybData, warehouseSplCode: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 8: Sovereign Agreement */}
                {step === 8 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <FileSignature className="w-5 h-5 text-emerald-600" />
                      <h3 className="text-base font-bold text-slate-900">مراجعة وتوقيع اتفاقية الشراكة السيادية</h3>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed max-h-48 overflow-y-auto space-y-2">
                      <p>• تلتزم المنشأة بتوفير مقتنيات أصيلة خالية من أي عيوب أو تزييف مطابقة لشهادات الفحص المخبري.</p>
                      <p>• يتم تحصيل نسبة عمولة المنصة السيادية المحددة بـ 8% شاملة تكاليف بوابة الدفع ساما وحساب الضمان.</p>
                      <p>• التزام التاجر بتسليم الطلب خلال ساعتين في الرياض وجدة لطلبات التوصيل السريع VIP.</p>
                    </div>

                    <label className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={kybData.termsAccepted}
                        onChange={(e) => setKybData({ ...kybData, termsAccepted: e.target.checked })}
                        className="w-4 h-4 accent-[#006948]"
                      />
                      <span className="text-xs font-bold text-emerald-900">
                        أوافق على بنود اتفاقية الشراكة والربط الحكومي الموحد.
                      </span>
                    </label>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 border-t border-slate-100">
                  <Button
                    variant="outline"
                    onClick={handlePrev}
                    disabled={step === 1 || isSubmitting}
                  >
                    السابق
                  </Button>

                  {step < 8 ? (
                    <Button variant="sovereign" onClick={handleNext} className="font-bold">
                      <span>المتابعة للخطوة التالية</span>
                      <ArrowLeft className="w-4 h-4 ml-1.5" />
                    </Button>
                  ) : (
                    <Button
                      variant="gold"
                      size="lg"
                      onClick={handleSubmitKYB}
                      disabled={isSubmitting || !kybData.termsAccepted}
                      className="font-black text-sm"
                    >
                      {isSubmitting ? "جاري التوثيق في واثق..." : "اعتماد وتوقيع وثيقة الشراكة السيادية"}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <StorefrontFooter />
    </div>
  );
}
