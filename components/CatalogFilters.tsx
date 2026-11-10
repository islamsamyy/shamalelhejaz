"use client";

import React from "react";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Filter,
  Search,
  X,
  CheckCircle2,
  Truck,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { formatSAR } from "@/lib/utils";

export interface CatalogFilterCategory {
  id: string;
  label: string;
}

export interface CatalogFiltersProps {
  categories: CatalogFilterCategory[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  maxLimit?: number;
  expressOnly: boolean;
  onExpressOnlyChange: (checked: boolean) => void;
  searchFilter: string;
  onSearchFilterChange: (q: string) => void;
  onReset: () => void;
  activeFilterCount: number;
}

export function CatalogFiltersContent({
  categories,
  selectedCategory,
  onSelectCategory,
  priceRange,
  onPriceRangeChange,
  maxLimit = 10000,
  expressOnly,
  onExpressOnlyChange,
  searchFilter,
  onSearchFilterChange,
  onReset,
  activeFilterCount,
}: CatalogFiltersProps) {
  return (
    <div className="space-y-5">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#006948]" />
            <span>تصفية النتائج الذكية</span>
          </h3>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="text-[11px] text-[#006948] hover:underline font-bold cursor-pointer"
            >
              إعادة تعيين ({activeFilterCount})
            </button>
          )}
        </div>

        {/* Search in catalog */}
        <div className="relative">
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => onSearchFilterChange(e.target.value)}
            placeholder="ابحث داخل هذا القسم..."
            className="w-full text-xs ps-9 pe-8 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#006948] bg-slate-50 focus:bg-white transition-colors"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute start-3 top-3" />
          {searchFilter && (
            <button
              type="button"
              onClick={() => onSearchFilterChange("")}
              className="absolute end-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              aria-label="مسح البحث"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <Accordion
          type="multiple"
          defaultValue={["categories", "price", "delivery"]}
          className="w-full"
        >
          {/* Expandable Categories */}
          <AccordionItem value="categories" className="border-slate-100">
            <AccordionTrigger className="py-3 text-xs font-bold text-slate-800 hover:no-underline">
              الأقسام والتصنيفات المعتمدة
            </AccordionTrigger>
            <AccordionContent className="pb-3 pt-1">
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onSelectCategory(cat.id)}
                    className={`w-full text-start px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                      selectedCategory === cat.id
                        ? "bg-[#006948] text-white font-bold shadow-xs"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>{cat.label}</span>
                    {selectedCategory === cat.id && (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Dual Slider Price Range */}
          <AccordionItem value="price" className="border-slate-100">
            <AccordionTrigger className="py-3 text-xs font-bold text-slate-800 hover:no-underline">
              نطاق السعر (ر.س)
            </AccordionTrigger>
            <AccordionContent className="pb-4 pt-2 space-y-3">
              <div className="flex items-center justify-between text-[11px] font-bold font-mono text-[#006948] bg-emerald-50/70 px-3 py-2 rounded-xl border border-emerald-100">
                <span>{formatSAR(priceRange[0])}</span>
                <span className="text-slate-400 font-sans">إلى</span>
                <span>{formatSAR(priceRange[1])}</span>
              </div>
              <Slider
                min={0}
                max={maxLimit}
                step={50}
                value={priceRange}
                onValueChange={(val) => {
                  if (val.length >= 2) {
                    onPriceRangeChange([
                      Math.min(val[0], val[1]),
                      Math.max(val[0], val[1]),
                    ]);
                  }
                }}
                className="py-2"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>٠ ر.س</span>
                <span>{Math.round(maxLimit / 2).toLocaleString("en-US")} ر.س</span>
                <span>{maxLimit.toLocaleString("en-US")} ر.س</span>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Express Shipping & Verification */}
          <AccordionItem value="delivery" className="border-b-0">
            <AccordionTrigger className="py-3 text-xs font-bold text-slate-800 hover:no-underline">
              الشحن والضمان السيادي
            </AccordionTrigger>
            <AccordionContent className="pb-2 pt-1">
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/70 cursor-pointer select-none transition-colors">
                <input
                  type="checkbox"
                  checked={expressOnly}
                  onChange={(e) => onExpressOnlyChange(e.target.checked)}
                  className="rounded border-slate-300 text-[#006948] focus:ring-[#006948] w-4 h-4 accent-[#006948]"
                />
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>توصيل فوري خلال ٢٤ ساعة فقط</span>
                </span>
              </label>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Trust Callout */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-3 border border-slate-800">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
          <ShieldCheck className="w-4 h-4" />
          <span>حماية المشتري المعتمدة</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          أموالك محفوظة في حساب ضمان مصرفي مستقل. لا تحول إلى البائع إلا بعد استلامك للمنتج وتأكيد مطابقته للمواصفات.
        </p>
        <Button
          asChild
          variant="gold"
          size="sm"
          className="w-full rounded-xl text-xs font-bold h-9"
        >
          <Link href="/about">تعرف على نظام الضمان Escrow</Link>
        </Button>
      </div>
    </div>
  );
}

export function CatalogMobileFilterSheet(props: CatalogFiltersProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="lg:hidden rounded-2xl border-slate-200 bg-white font-bold text-xs gap-1.5 h-9 px-3.5"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#006948]" />
          <span>الفلاتر</span>
          {props.activeFilterCount > 0 && (
            <Badge variant="sovereign" className="px-1.5 py-0 text-[10px]">
              {props.activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[88vw] max-w-sm overflow-y-auto bg-[#f8fafc] p-4"
      >
        <SheetHeader className="mb-4 text-start">
          <SheetTitle className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#006948]" />
            <span>خيارات التصفية والبحث</span>
          </SheetTitle>
        </SheetHeader>
        <CatalogFiltersContent {...props} />
      </SheetContent>
    </Sheet>
  );
}
