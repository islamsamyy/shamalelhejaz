"use client";

import React from "react";
import Link from "next/link";
import StorefrontHeader from "@/components/StorefrontHeader";
import StorefrontFooter from "@/components/StorefrontFooter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Award,
  Sparkles,
  Building,
  Store,
  Truck,
  RotateCcw,
  CheckCircle2,
  Users,
  TrendingUp,
  BarChart3,
  Lock,
  Headphones,
  Check,
  ChevronLeft,
  ArrowLeft,
  Star,
  Layers,
  HelpCircle,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function AboutUsPage() {
  const platformStats = [
    { value: "١٢,٥٠٠+", label: "تاجر ومورّد معتمد", sub: "فحص رسمي للسجل التجاري KYB" },
    { value: "٥٠٠,٠٠٠+", label: "منتج أصلي نشط", sub: "مواصفات ساسو وهيئة الغذاء والدواء" },
    { value: "٣,٨٠٠,٠٠٠+", label: "طلب تم تسليمه بنجاح", sub: "توصيل خلال ٢٤ إلى ٤٨ ساعة" },
    { value: "٩٩.٦٪", label: "نسبة رضا المشترين", sub: "حماية مالية وضمان استرجاع" },
  ];

  const vendorStoreFeatures = [
    {
      icon: Store,
      title: "تسوق مباشر من كبار الموردين والمصنعين",
      desc: "نلغي حلقات الوساطة التقليدية وهوامش الربح المبالغ فيها لنربط المستهلك مباشرة بالمستودعات والموزعين المعتمدين، مما يضمن أفضل سعر مبيعاً في السوق.",
      badge: "توفير يصل إلى ٤٠٪",
    },
    {
      icon: ShieldCheck,
      title: "حماية المشتري بنظام الضمان المالي (Escrow)",
      desc: "أموالك في أمان تام؛ عند إتمام الدفع، تُحفظ القيمة في حساب ضمان بنكي مستقل ولا تُحوّل إلى البائع إلا بعد استلامك للمنتج وفحصه والتأكد من مطابقة المواصفات.",
      badge: "أمان بنكي ١٠٠٪",
    },
    {
      icon: Award,
      title: "ضمان الأصالة الذهبي وسياسة فحص الجودة",
      desc: "لا مكان للسلع المقلدة على شمال الحجاز. تخضع كل منشأة لتدقيق صارم ونلزم جميع التجار بتقديم شهادات الاستيراد الرسمية وضمان الوكيل المعتمد لمدة سنتين.",
      badge: "ضمان سنتين معتمد",
    },
    {
      icon: Truck,
      title: "شبكة لوجستية ذكية وشحن فائق السرعة",
      desc: "شراكات استراتيجية مع كبرى شركات الشحن (سبل SPL، سمسا SMSA، أرامكس) تضمن توصيل الطلبات خلال ٢٤ إلى ٤٨ ساعة مع تتبع فوري مباشر لحركة الشحنة.",
      badge: "توصيل ٢٤ ساعة",
    },
    {
      icon: RotateCcw,
      title: "إرجاع سهل وسريع خلال ١٤ يوماً",
      desc: "إن لم تكن راضياً عن مشترياتك، يمكنك تقديم طلب إرجاع بنقرة واحدة عبر لوحة حسابك واسترداد أموالك فوراً إلى بطاقتك دون أسئلة معقدة.",
      badge: "إرجاع مجاني ميسر",
    },
    {
      icon: BarChart3,
      title: "استوديو تمكين التجار السحابي (Vendor Studio)",
      desc: "نوفر لشركائنا من التجار منصة برمجية متكاملة لإدارة المخزون، معالجة الطلبات، تحليلات المبيعات الفورية، والربط المؤتمت مع الفاتورة الإلكترونية زاتكا.",
      badge: "حلول B2B متطورة",
    },
  ];

  const faqs = [
    {
      q: "ما هي منصة شمال الحجاز وكيف تختلف عن المتاجر التقليدية؟",
      a: "شمال الحجاز هي منصة تجارة إلكترونية متعددة البائعين (Multi-Vendor Marketplace) تجمع آلاف الموردين، الوكلاء المعتمدين، والمصانع مباشرة مع المشترين في منصة موحدة. هذا يتيح للمشتري الحصول على أفضل الأسعار والمنتجات الأكثر مبيعاً مع التمتع بحماية مالية متكاملة، بدلاً من التعامل مع متاجر متفرقة غير موثوقة.",
    },
    {
      q: "كيف يضمن نظام الضمان المالي (Escrow) حقي كمشتري؟",
      a: "عندما تقوم بالشراء والدفع عبر مدى، أبل باي، أو البطاقات الائتمانية، لا تذهب أموالك مباشرة إلى حساب البائع. بل تظل محفوظة في حساب وسيط آمن (Escrow). بعد استلام الشحنة وتأكيد مطابقتها، يتم تحرير المبلغ للبائع. وإذا واجهت أي مشكلة، يُعاد المبلغ إلى حسابك بالكامل فوراً.",
    },
    {
      q: "هل جميع المنتجات المعروضة في المنصة أصلية وبضمان الوكيل؟",
      a: "نعم بنسبة 100%. نطبق سياسة 'عدم التسامح المطلق' مع المنتجات المقلدة. يمر كل تاجر بعملية تدقيق صارمة (KYB) تشمل فحص السجل التجاري، التوثيق عبر النفاذ الوطني ومنصة واثق، والتأكد من مطابقة السلع لهيئة المواصفات والمقاييس (SASO) وهيئة الغذاء والدواء (SFDA).",
    },
    {
      q: "كيف يمكنني كصاحب عمل أو مورّد البدء في البيع على منصة شمال الحجاز؟",
      a: "يمكنك التسجيل في دقائق عبر بوابة التجار (Vendor B2B). يتطلب الأمر سجلاً تجارياً نشطاً أو وثيقة عمل حر معتمدة، وتوثيقاً عبر نفاذ. نمنحك اشتراكاً فورياً بـ 0% رسوم إدراج مع لوحة تحكم ذكية لإدارة المخزون والربط الآلي مع الفاتورة الإلكترونية ZATCA Phase-2.",
    },
    {
      q: "ما هي خيارات الشحن ومدة التوصيل المتاحة؟",
      a: "نوفر خدمة الشحن السريع Express داخل المدن الرئيسية (الرياض، جدة، الدمام، مكة، المدينة) خلال ٢٤ ساعة فقط، وتوصيلاً قياسياً لبقية مدن ومحافظات المملكة والخليج خلال ٤٨ إلى ٧٢ ساعة عبر شبكتنا اللوجستية المتكاملة.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      <StorefrontHeader />

      <main className="flex-1 pt-32 lg:pt-36">
        {/* Breadcrumb Navigation */}
        <section className="bg-white border-b border-slate-200/80 py-4">
          <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
            <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Link href="/" className="hover:text-[#006948] transition-colors">
                الرئيسية
              </Link>
              <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[#006948] font-bold">من نحن • منصة شمال الحجاز المعتمدة</span>
            </nav>
          </div>
        </section>

        {/* Hero Section */}
        <section className="bg-gradient-to-b from-white via-slate-50 to-[#f8fafc] py-16 lg:py-24 border-b border-slate-200/80">
          <div className="max-w-[1000px] mx-auto px-4 lg:px-8 text-center">
            <Badge variant="sovereign" className="mb-4 text-xs py-1 px-3">
              <Sparkles className="w-3.5 h-3.5 ms-1 text-emerald-600" />
              شمال الحجاز للمتاجر المعتمدة • المنظومة الرائدة للتجارة الإلكترونية
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
              نصلك بأفضل الموردين المعتمدين، لنمنحك المنتجات الأكثر مبيعاً بأقل الأسعار
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-5 max-w-3xl mx-auto leading-relaxed">
              تأسست <strong>منصة شمال الحجاز</strong> لتحدث ثورة في مفهوم التسوق الرقمي؛ من خلال بناء الجسر المباشر بين المصنعين والوكلاء المعتمدين والمستهلك الذكي. نجمع بين وفرة الخيارات، الشفافية المطلقة، حماية المشتري المصرفية، وتجربة شحن فائقة السرعة.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
              <Button asChild variant="sovereign" size="lg" className="rounded-2xl font-bold text-xs h-12 px-6">
                <Link href="/catalog" className="flex items-center gap-2">
                  <span>تصفح المنتجات الأكثر مبيعاً</span>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-2xl font-bold text-xs h-12 px-6 border-slate-300">
                <Link href="/vendor/register" className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-emerald-700" />
                  <span>انضم كتاجر معتمد (Vendor B2B)</span>
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Ecosystem Key Metrics */}
        <section className="max-w-[1400px] mx-auto px-4 lg:px-8 -mt-8 relative z-10 mb-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-lg">
            {platformStats.map((stat, idx) => (
              <div key={idx} className="p-4 text-center border-e last:border-e-0 border-slate-100">
                <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#006948] font-mono block">
                  {stat.value}
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 block mt-1">
                  {stat.label}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  {stat.sub}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Platform Features Grid */}
        <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-10">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-[#006948] uppercase tracking-wider block mb-1">
              مزايا منصة شمال الحجاز المتطورة
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              لماذا يتسوق الملايين عبر منصة شمال الحجاز ومتاجرها المعتمدة؟
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              صممنا كل ميزة في المنصة لتمنحك الأمان، التوفير، وسرعة الحصول على أفضل منتجات العالم بين يديك.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendorStoreFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#006948] flex items-center justify-center font-bold">
                        <Icon className="w-6 h-6" />
                      </div>
                      <Badge variant="outline" className="text-[11px] font-bold text-emerald-800 bg-emerald-50/50 border-emerald-200">
                        {feat.badge}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base leading-snug mb-2">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                  <div className="pt-4 mt-6 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>ميزة مفعلة لجميع الطلبات</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section: How Shamal Al-Hijaz Works (Dual Column: Shopper vs Vendor) */}
        <section className="w-full bg-white border-y border-slate-200/80 py-16 my-10">
          <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-[#006948] uppercase tracking-wider block mb-1">
                دورة العمل المتكاملة
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                كيف تعمل منصة شمال الحجاز؟ تجربة مصممة للجميع
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2">
                سواء كنت مشترياً تبحث عن أفضل العروض، أو تاجراً يسعى لمضاعفة مبيعاته.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* For Shoppers */}
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">رحلة المشتري الذكي</h3>
                      <p className="text-xs text-slate-500">خطوات بسيطة لتسوق مضمون بأفضل سعر</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { step: "١", title: "تصفح ومقارنة الأسعار", desc: "اختر من بين مئات الآلاف من المنتجات وقارن تقييمات التجار المعتمدين والمواصفات المعتمدة." },
                      { step: "٢", title: "دفع آمن مع حفظ المبلغ في الضمان", desc: "ادفع عبر مدى أو أبل باي؛ يظل المبلغ محفوظاً في حساب Escrow ولا يُسلم للبائع إلا برضاك." },
                      { step: "٣", title: "توصيل سريع وتتبع لحظي", desc: "استلم شحنتك خلال ٢٤-٤٨ ساعة مع تحديثات لحظية عبر الرسائل النصية وخريطة التتبع." },
                      { step: "٤", title: "فحص السلعة وضمان ١٤ يوماً", desc: "عاين المنتج وتأكد من جودته مع إمكانية الإرجاع الفوري واسترداد الأموال بنقرة واحدة." },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3.5 bg-white p-4 rounded-2xl border border-slate-200/80">
                        <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                          {item.step}
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button asChild variant="sovereign" className="w-full mt-6 rounded-2xl font-bold text-xs h-11">
                  <Link href="/catalog">ابدأ رحلة التسوق الآن</Link>
                </Button>
              </div>

              {/* For Vendors */}
              <div className="p-8 rounded-3xl bg-slate-900 text-white flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">رحلة التاجر والمورّد (B2B)</h3>
                      <p className="text-xs text-slate-400">انضم لأسرع منصات التجارة نمواً في المنطقة</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { step: "١", title: "توثيق المنشأة في دقائق عبر KYB", desc: "ربط فوري بالسجل التجاري عبر نفاذ ومنصة واثق دون تعقيدات ورقية." },
                      { step: "٢", title: "إدراج المنتجات بـ 0% رسوم إدراج", desc: "ارفع كتالوج منتجاتك وصورك وتحكم في مخزونك وتسعيرك التنافسي بكل حرية." },
                      { step: "٣", title: "معالجة الطلبات وبوالص الشحن الآلية", desc: "اطبع بوالص الشحن بنقرة واحدة لتستلم شركات الشحن الطلبات مباشرة من مستودعك." },
                      { step: "٤", title: "تسوية مالية أسبوعية مؤتمتة", desc: "تودع أرباحك مباشرة في حساب منشأتك البنكي مع إصدار فواتير زاتكا ZATCA Phase-2." },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3.5 bg-slate-800/90 p-4 rounded-2xl border border-slate-700/80">
                        <span className="w-7 h-7 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                          {item.step}
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-white">{item.title}</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button asChild variant="gold" className="w-full mt-6 rounded-2xl font-bold text-xs h-11">
                  <Link href="/vendor/register">سجل متجرك وابدأ البيع اليوم</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Strict Vendor Vetting & Trust Architecture */}
        <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-12">
          <div className="bg-gradient-to-l from-[#004d34] via-[#006948] to-slate-950 text-white p-8 lg:p-12 rounded-3xl shadow-xl border border-emerald-700/60">
            <div className="max-w-3xl mb-8">
              <Badge variant="outline" className="bg-white/10 text-emerald-300 border-white/20 text-xs mb-3">
                ميثاق الجودة والموثوقية
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-3">
                كيف نحمي تجربة التسوق ونتحقق من كل تاجر في المنصة؟
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                لا نكتفي بفتح الأبواب لكل بائع؛ بل نطبق بروتوكول فحص مؤسسي متكامل يضمن أن كل شحنة تخرج إلى العميل تحمل أعلى مواصفات الأمان والجودة العالمية.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                <div className="w-10 h-10 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center font-bold mb-3">
                  <Building className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-white mb-1.5">توثيق واثق ونفاذ الوطني</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  التحقق الآلي من نظامية السجل التجاري، التراخيص البلدية، ورقم هوية المفوض عبر الربط المباشر مع المنصات الحكومية الرسمية.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold mb-3">
                  <Lock className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-white mb-1.5">امتثال الفوترة الإلكترونية ZATCA</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  إصدار فواتير إلكترونية مشفرة بـ QR Code متوافقة مع متطلبات المرحلة الثانية لهيئة الزكاة والضريبة والجمارك لحماية حقوق الجميع.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                <div className="w-10 h-10 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center font-bold mb-3">
                  <Award className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-white mb-1.5">مطابقة SASO و SFDA</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  فحص شهادات المطابقة لسلامة الأجهزة الإلكترونية ومستحضرات العناية الشخصية والأغذية لضمان سلامة وصحة المستهلك.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Interactive SEO FAQ */}
        <section className="max-w-[1000px] mx-auto px-4 lg:px-8 py-12">
          <div className="text-center max-w-xl mx-auto mb-10">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#006948] mb-1">
              <HelpCircle className="w-4 h-4" />
              <span>مركز المعرفة والأسئلة الشائعة</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              إجابات على كل ما تبحث عنه حول منصة شمال الحجاز
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              كل ما تحتاج لمعرفته حول التسوق، الأمان، الشحن، وسياسات التجار.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-3">
            {faqs.map((faq, idx) => (
              <AccordionItem
                key={idx}
                value={`faq-${idx}`}
                className="bg-white rounded-2xl border border-slate-200/80 px-6 shadow-xs overflow-hidden"
              >
                <AccordionTrigger className="text-start font-bold text-sm text-slate-900 hover:text-[#006948] py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-slate-600 leading-relaxed pb-4 border-t border-slate-100 pt-3">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Final Conversion Call To Action */}
        <section className="max-w-[1400px] mx-auto px-4 lg:px-8 pb-16">
          <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-800 shadow-2xl">
            <div className="max-w-xl text-center md:text-start">
              <span className="text-xs font-bold text-amber-400 block mb-1">
                ابدأ رحلتك معنا اليوم
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white leading-snug">
                انضم إلى ملايين المتسوقين وآلاف التجار الناجحين في شمال الحجاز
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                سواء كنت ترغب باقتناء أحدث الإلكترونيات بأسعار المورّد، أو تود فتح متجرك وتوسيع تجارتك؛ منصة شمال الحجاز هي وجهتك الأولى المعتمدة.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button asChild variant="gold" size="lg" className="rounded-2xl font-bold text-xs h-12 px-6">
                <Link href="/catalog">تسوق أفضل العروض</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-white/10 text-white border-white/20 hover:bg-white/20 rounded-2xl font-bold text-xs h-12 px-6">
                <Link href="/vendor/register">فتح متجر تجاري</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <StorefrontFooter />
    </div>
  );
}
