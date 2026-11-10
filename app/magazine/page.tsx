"use client";

import React from "react";
import Link from "next/link";
import StorefrontHeader from "@/components/StorefrontHeader";
import StorefrontFooter from "@/components/StorefrontFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { Sparkles, ShoppingBag, ArrowLeft, ChevronLeft, BookOpen, Clock } from "lucide-react";
import { formatSAR } from "@/lib/utils";

const articles = [
  {
    id: "oud-guide",
    title: "دليل المقتني لأدهان العود المعتقة: أسرار التعتيق والتمييز بين الكلمنتان والآسامي",
    category: "أطياب ملكية",
    readTime: "٥ دقائق قراءة",
    date: "٨ نوفمبر ٢٠٢٦",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80",
    excerpt: "تعرف على تاريخ تقطير خشب العود في شبه الجزيرة العربية، وكيف تحافظ على عبير التولة النادرة لعقود طويلة دون أن تفقد خواصها الأرستقراطية.",
    product: {
      id: "oud-cambodi-vintage",
      title: "دهن عود ملكي معتق ٦٠ عاماً",
      price: 12500,
      image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&auto=format&fit=crop&q=80",
      vendor: "بيت العود المعتق",
    },
  },
  {
    id: "hasawi-heritage",
    title: "البشت الحساوي: تاريخ حياكة الزري الألماني المذهب بأيدي شيوخ الصنعة في الهفوف",
    category: "أزياء تراثية",
    readTime: "٧ دقائق قراءة",
    date: "٥ نوفمبر ٢٠٢٦",
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop&q=80",
    excerpt: "رحلة وثائقية في أزقة الأحساء القديمة لاستكشاف فن حياكة الدقة الملكية التي ارتداها ملوك وأمراء الدولة السعودية عبر العصور.",
    product: {
      id: "hasawi-royal-bisht",
      title: "بشت حساوي ملكي زري ألماني عيار أول",
      price: 8900,
      image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&auto=format&fit=crop&q=80",
      vendor: "مشلح الأحساء التراثي",
    },
  },
  {
    id: "falconry-nobility",
    title: "رياضة الملوك: كيف يختار الصقار العربي عتاد طيره بين جلود الغزال وخواتم الفضة",
    category: "عتاد الصقارة",
    readTime: "٤ دقائق قراءة",
    date: "١ نوفمبر ٢٠٢٦",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80",
    excerpt: "مواصفات البرقع المثالي والدس المخصص لتدريب الصقور الحرة في صحراء الدهناء والربع الخالي، والرمزية التراثية في رؤية 2030.",
    product: {
      id: "falcon-hood-gold",
      title: "برقع صقر ملكي بخيوط الذهب",
      price: 2800,
      image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80",
      vendor: "ديوان الصقارين السعوديين",
    },
  },
];

export default function SouqMagazinePage() {
  const { addToCart } = useCart();

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col">
      <StorefrontHeader />

      <main className="flex-1 pt-32 lg:pt-36">
        <section className="bg-white border-b border-slate-200/80 py-8">
          <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
            <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2">
              <Link href="/" className="hover:text-[#006948] transition-colors">الرئيسية</Link>
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="text-[#006948] font-bold">مجلة شمال الحجاز التحريرية</span>
            </nav>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="sovereign">المنشورات التحريرية الرسمية</Badge>
                  <span className="text-xs text-slate-400">إصدارات ديوان الفخامة</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                  مجلة شمال الحجاز (Shamal Al-Hijaz Magazine)
                </h1>
                <p className="text-xs text-slate-500 mt-1 max-w-xl">
                  مقالات توثيقية ودراسات فنية حول تاريخ الحِرف ونوادر المقتنيات، مع إمكانية اقتناء القطع المذكورة مباشرة.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Shoppable Articles Grid */}
        <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {articles.map((art) => (
              <div
                key={art.id}
                className="bg-white rounded-3xl border border-slate-200/80 hover:border-emerald-300 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={art.image}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge variant="sovereign" className="bg-white/95">
                        {art.category}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-2">
                      <span>{art.date}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {art.readTime}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-[#006948] transition-colors">
                      {art.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                      {art.excerpt}
                    </p>

                    {/* Shoppable Product Callout Box */}
                    <div className="mt-5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-white overflow-hidden shrink-0 border border-slate-200">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={art.product.image}
                            alt={art.product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="truncate">
                          <span className="text-[10px] text-emerald-800 font-bold block">مقتنى المقال الموثق</span>
                          <h5 className="text-xs font-bold text-slate-900 truncate max-w-[140px]">
                            {art.product.title}
                          </h5>
                          <span className="text-xs font-black text-[#006948] block">
                            {formatSAR(art.product.price)}
                          </span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="sovereign"
                        className="h-8 px-3 text-[11px] font-bold shrink-0"
                        onClick={() => addToCart(art.product)}
                      >
                        اقتناء الآن
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Button variant="outline" className="w-full text-xs font-bold rounded-xl">
                    قراءة المقال التوثيقي كاملاً
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <StorefrontFooter />
    </div>
  );
}

