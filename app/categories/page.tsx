"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import StorefrontHeader from "@/components/StorefrontHeader";
import StorefrontFooter from "@/components/StorefrontFooter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ChevronLeft, Sparkles, Layers, CheckCircle2, Store, RefreshCw, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TOP_CATEGORIES, Category } from "@/lib/catalogData";
import { fetchCategoriesFromSupabase } from "@/lib/supabase";

export default function CategoriesDirectoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

  const loadCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const dbCategories = await fetchCategoriesFromSupabase();
      if (dbCategories && dbCategories.length > 0) {
        setCategories(dbCategories);
      } else {
        setCategories(TOP_CATEGORIES);
      }
    } catch (err: any) {
      console.error("Failed to load categories:", err);
      setError("تعذر تحميل الأقسام من الخادم. يرجى إعادة المحاولة.");
      setCategories(TOP_CATEGORIES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const departments = [
    { id: "all", label: "كافة الأقسام الـ ٦٣" },
    { id: "الإلكترونيات والأجهزة", label: "الإلكترونيات والأجهزة" },
    { id: "قطع غيار السيارات والإكسسوارات", label: "قطع غيار السيارات (لكل علامة)" },
    { id: "المنزل والأثاث والديكور", label: "المنزل والأثاث والديكور" },
    { id: "العطور والملابس", label: "العطور والملابس" },
    { id: "الرحلات والزراعة والصناعة", label: "الرحلات والصناعة والزراعة" },
    { id: "البناء والمواد", label: "البناء والمواد" },
    { id: "الذهب والإكسسوارات", label: "الذهب والإكسسوارات" },
  ];

  const displayedCategories =
    selectedDepartment === "all"
      ? categories
      : categories.filter((c: any) => c.department === selectedDepartment || c.id === selectedDepartment);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      <StorefrontHeader />

      <main className="flex-1 pt-32 lg:pt-36">
        {/* Page Header */}
        <section className="bg-white border-b border-slate-200/80 py-8">
          <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
            <nav className="flex items-center gap-2 text-xs text-slate-500 mb-3">
              <Link href="/" className="hover:text-[#006948] transition-colors">
                الرئيسية
              </Link>
              <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[#006948] font-bold">فهرس الأقسام الـ ٦٣ المعتمدة</span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <Badge variant="sovereign" className="mb-2">
                  دليل التصنيفات الرسمية المعتمدة ٢٠٢٦
                </Badge>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  فهرس الأقسام والمنتجات الأكثر مبيعاً
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                  تصفح أكبر دليل للتجارة الإلكترونية متعددة البائعين في المملكة العربية السعودية. أقسام متكاملة لكل مجالات التجارة والقطع الأصلية بضمان الجودة وسرعة التوصيل.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button asChild variant="gold" size="sm" className="rounded-xl font-bold text-xs h-10 px-4">
                  <Link href="/catalog">تصفح كافة المنتجات</Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="rounded-xl font-bold text-xs h-10 px-4 border-slate-300">
                  <Link href="/vendor/register">بيع في أحد هذه الأقسام</Link>
                </Button>
              </div>
            </div>

            {/* Department Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 mt-6 pt-2 border-t border-slate-100">
              {departments.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDepartment(dept.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedDepartment === dept.id
                      ? "bg-[#006948] text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {dept.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-10">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-3xl bg-white border border-slate-200/80 p-4 space-y-4">
                  <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-white p-8 rounded-3xl border border-rose-200 text-center max-w-md mx-auto">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
              <p className="text-xs text-slate-600 mb-4">{error}</p>
              <Button onClick={loadCategories} variant="sovereign" size="sm" className="rounded-xl">
                <RefreshCw className="w-3.5 h-3.5 me-1.5" /> إعادة المحاولة
              </Button>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                {displayedCategories.map((cat, idx) => (
                  <motion.div
                    key={cat.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: Math.min(idx * 0.04, 0.3) }}
                    whileHover={{ y: -6 }}
                    className="group rounded-3xl bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {/* Category Image Banner */}
                      <div className="relative aspect-[16/9] bg-slate-100 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={cat.image}
                          alt={cat.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                        <div className="absolute bottom-4 start-4 end-4 flex items-end justify-between text-white">
                          <div>
                            <Badge variant="sovereign" className="bg-white/20 backdrop-blur-md text-white border-white/30 text-[10px] mb-1">
                              {cat.itemCount}
                            </Badge>
                            <h2 className="text-lg font-black text-white group-hover:text-emerald-300 transition-colors">
                              {cat.title}
                            </h2>
                          </div>
                        </div>
                      </div>

                      {/* Body Content */}
                      <div className="p-6">
                        <p className="text-xs text-slate-500 leading-relaxed mb-5">
                          {cat.subtitle}
                        </p>

                        {/* Subcategories List */}
                        {cat.subcategories && cat.subcategories.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-[11px] font-bold text-slate-700 block mb-2">
                              التفريعات والمنتجات الأكثر طلباً:
                            </span>
                            {cat.subcategories.map((sub, sIdx) => (
                              <Link
                                key={sIdx}
                                href={`/catalog?cat=${cat.id}&q=${encodeURIComponent(sub.name)}`}
                                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 text-xs transition-colors group/sub"
                              >
                                <span className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                  <span className="font-medium group-hover/sub:font-bold">{sub.name}</span>
                                  {sub.popular && (
                                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-md">
                                      الأكثر رواجاً
                                    </span>
                                  )}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400 group-hover/sub:text-emerald-700">
                                  {sub.count}
                                </span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Action */}
                    <div className="p-6 pt-0">
                      <Button asChild variant="outline" className="w-full rounded-xl text-xs font-bold border-slate-200 hover:bg-[#006948] hover:text-white transition-colors h-10">
                        <Link href={`/catalog?cat=${cat.id}`} className="flex items-center justify-center gap-2">
                          <span>استكشف عروض قسم {cat.title}</span>
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </section>
      </main>

      <StorefrontFooter />
    </div>
  );
}
