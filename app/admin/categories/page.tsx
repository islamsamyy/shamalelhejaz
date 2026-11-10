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
  FolderTree,
  PlusCircle,
  Edit2,
  Trash2,
  ChevronDown,
  Layers,
  Sparkles,
  CheckCircle2,
  Percent,
} from "lucide-react";
import { toast } from "sonner";

interface SubCategory {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  productsCount: number;
}

interface ParentCategory {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  commission: number;
  vatRate: number;
  icon: string;
  active: boolean;
  subcategories: SubCategory[];
}

const initialTaxonomy: ParentCategory[] = [
  {
    id: "cat-1",
    nameAr: "الساعات والكرونوغراف الفاخر",
    nameEn: "Luxury Watches & Chronographs",
    slug: "watches",
    commission: 10,
    vatRate: 15,
    icon: "⌚",
    active: true,
    subcategories: [
      { id: "sub-1-1", nameAr: "ساعات الصقر الملكية", nameEn: "Royal Falcon Editions", slug: "falcon-editions", productsCount: 14 },
      { id: "sub-1-2", nameAr: "كرونوغراف الذهب الوردي", nameEn: "Rose Gold Chrono", slug: "rose-gold", productsCount: 9 },
      { id: "sub-1-3", nameAr: "إصدارات اليوم الوطني المحدودة", nameEn: "National Day Limited", slug: "national-day", productsCount: 6 },
    ],
  },
  {
    id: "cat-2",
    nameAr: "البشوت والمشالح الملكية",
    nameEn: "Royal Bishts & Robes",
    slug: "bishts",
    commission: 8,
    vatRate: 15,
    icon: "🧥",
    active: true,
    subcategories: [
      { id: "sub-2-1", nameAr: "البشت الحساوي الغاط الملكي", nameEn: "Hasawi Royal Weave", slug: "hasawi-royal", productsCount: 22 },
      { id: "sub-2-2", nameAr: "مشالح الوبر الصيفي الفاخر", nameEn: "Summer Camel Hair", slug: "camel-hair", productsCount: 15 },
      { id: "sub-2-3", nameAr: "الدقة الملكية بالزري الألماني 24K", nameEn: "24K German Gold Zari", slug: "gold-zari", productsCount: 11 },
    ],
  },
  {
    id: "cat-3",
    nameAr: "دهن العود والبخور والمقطرات",
    nameEn: "Aged Oud, Incense & Attars",
    slug: "oud-perfumes",
    commission: 12,
    vatRate: 15,
    icon: "🪵",
    active: true,
    subcategories: [
      { id: "sub-3-1", nameAr: "دهن عود كلمنتان غابات معتق", nameEn: "Aged Kalimantan Oud", slug: "aged-kalimantan", productsCount: 28 },
      { id: "sub-3-2", nameAr: "خلاصة الورد الطائفي النخب الأول", nameEn: "Taif Rose Extract", slug: "taif-rose", productsCount: 16 },
      { id: "sub-3-3", nameAr: "بخور المروكي السوبر الملكي", nameEn: "Super Maroki Wood", slug: "super-maroki", productsCount: 20 },
    ],
  },
  {
    id: "cat-4",
    nameAr: "التحف والمقتنيات التراثية",
    nameEn: "Heritage Antiques & Daggers",
    slug: "heritage-antiques",
    commission: 7,
    vatRate: 15,
    icon: "🗡️",
    active: true,
    subcategories: [
      { id: "sub-4-1", nameAr: "الخناجر والسيوف النجدية والجنوبية", nameEn: "Najdi & Southern Daggers", slug: "swords-daggers", productsCount: 12 },
      { id: "sub-4-2", nameAr: "الدلال والأواني الحساوية المذهبة", nameEn: "Gilded Hasawi Coffee Pots", slug: "gilded-dallah", productsCount: 18 },
    ],
  },
];

export default function TaxonomyBuilderPage() {
  const [categories, setCategories] = useState<ParentCategory[]>(initialTaxonomy);
  
  // Add Category Dialog
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newNameAr, setNewNameAr] = useState("");
  const [newNameEn, setNewNameEn] = useState("");
  const [newCommission, setNewCommission] = useState(8);
  const [newIcon, setNewIcon] = useState("✨");

  const handleAddCategory = () => {
    if (!newNameAr.trim()) {
      toast.error("يرجى إدخال اسم القسم بالعربية");
      return;
    }
    const newCat: ParentCategory = {
      id: `cat-${Date.now()}`,
      nameAr: newNameAr,
      nameEn: newNameEn || newNameAr,
      slug: newNameAr.toLowerCase().replace(/\s+/g, "-"),
      commission: Number(newCommission),
      vatRate: 15,
      icon: newIcon,
      active: true,
      subcategories: [],
    };
    setCategories((prev) => [...prev, newCat]);
    toast.success(`تم إنشاء القسم الرئيسي "${newNameAr}" بنجاح!`);
    setIsAddOpen(false);
    setNewNameAr("");
    setNewNameEn("");
  };

  const handleToggleActive = (id: string, name: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
    toast.info(`تم تحديث حالة عرض القسم "${name}" في المتجر.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <FolderTree className="w-7 h-7 text-[#006948]" />
            هندسة وبناء هيكل الأقسام (Taxonomy Builder)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            إدارة شجرة الأقسام الرئيسية والفرعية، تحديد نسبة العمولة لكل تصنيف، وضبط ضريبة القيمة المضافة 15%.
          </p>
        </div>

        <Button
          variant="sovereign"
          size="sm"
          onClick={() => setIsAddOpen(true)}
          className="rounded-xl font-bold text-xs"
        >
          <PlusCircle className="w-4 h-4 ml-1.5" />
          إضافة قسم رئيسي جديد
        </Button>
      </div>

      {/* Category Tree Cards */}
      <div className="space-y-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 transition-all hover:border-emerald-300"
          >
            {/* Category Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-2xl shrink-0 shadow-xs">
                  {cat.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-slate-900 text-base">{cat.nameAr}</h3>
                    <Badge variant={cat.active ? "sovereign" : "outline"} className="text-[10px]">
                      {cat.active ? "نشط بالمتجر" : "مخفي مؤقتاً"}
                    </Badge>
                  </div>
                  <span className="text-xs text-slate-500 font-mono block mt-0.5">{cat.nameEn} • slug: /{cat.slug}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold">
                <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
                  عمولة القسم: <span className="font-mono text-[#006948] font-black">{cat.commission}%</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
                  ضريبة زاتكا: <span className="font-mono text-emerald-800 font-black">{cat.vatRate}%</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleActive(cat.id, cat.nameAr)}
                  className="rounded-xl text-xs h-8"
                >
                  {cat.active ? "إخفاء" : "تفعيل"}
                </Button>
              </div>
            </div>

            {/* Sub-categories Badges Matrix */}
            <div>
              <span className="text-xs font-bold text-slate-600 block mb-2">
                الأقسام والتصنيفات الفرعية ({cat.subcategories.length}):
              </span>
              <div className="flex flex-wrap gap-2">
                {cat.subcategories.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                  >
                    <span className="font-bold text-slate-800">{sub.nameAr}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({sub.productsCount} مقتنى)</span>
                  </div>
                ))}
                <button
                  onClick={() => toast.info(`إضافة تصنيف فرعي جديد يتبع: "${cat.nameAr}"`)}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl border border-dashed border-slate-300 text-slate-500 hover:text-[#006948] hover:border-emerald-400 text-xs font-bold transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>تصنيف فرعي</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Category Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-[#006948]" />
              إضافة قسم تصنيفي رئيسي جديد
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 my-2 text-xs">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                اسم القسم بالعربية:
              </label>
              <Input
                value={newNameAr}
                onChange={(e) => setNewNameAr(e.target.value)}
                placeholder="مثال: الخيول ولوازم الفروسية"
                className="rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                اسم القسم بالإنجليزية (English Name):
              </label>
              <Input
                value={newNameEn}
                onChange={(e) => setNewNameEn(e.target.value)}
                placeholder="e.g. Equestrian & Arabian Horses"
                className="rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  نسبة عمولة المنصة (%):
                </label>
                <Input
                  type="number"
                  value={newCommission}
                  onChange={(e) => setNewCommission(Number(e.target.value))}
                  className="rounded-xl text-xs font-bold font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  الأيقونة التعبيرية:
                </label>
                <Input
                  value={newIcon}
                  onChange={(e) => setNewIcon(e.target.value)}
                  className="rounded-xl text-xs text-center"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2 sm:justify-start">
            <Button
              variant="sovereign"
              size="sm"
              onClick={handleAddCategory}
              className="rounded-xl font-bold text-xs"
            >
              حفظ ونشر القسم
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddOpen(false)}
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

