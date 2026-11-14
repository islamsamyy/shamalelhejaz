"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import VendorNav from "@/components/vendor/VendorNav";
import StorefrontFooter from "@/components/StorefrontFooter";
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
  Search,
  Filter,
  PlusCircle,
  Edit3,
  ExternalLink,
  Trash2,
  Download,
  Upload,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  ArrowUpDown,
  Tag,
  Boxes,
} from "lucide-react";
import { formatSAR } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface CatalogProduct {
  id: string;
  sku: string;
  title: string;
  category: string;
  price: number;
  originalPrice?: number;
  stock: number;
  status: "active" | "pending" | "low_stock" | "inactive";
  image: string;
  salesCount: number;
  rating: number;
}

export default function VendorCatalogPage() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  
  // Edit Price Dialog State
  const [editingProduct, setEditingProduct] = useState<CatalogProduct | null>(null);
  const [newPrice, setNewPrice] = useState<number>(0);
  const [newStock, setNewStock] = useState<number>(0);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("فشل تحميل المنتجات: " + error.message);
        return;
      }

      const mapped: CatalogProduct[] = (data || []).map((row: any) => ({
        id: row.id,
        sku: row.sku || `SQ-${row.id.slice(0, 8).toUpperCase()}`,
        title: row.title,
        category: row.category,
        price: Number(row.price),
        originalPrice: row.original_price ? Number(row.original_price) : undefined,
        stock: Number(row.stock_qty ?? 10),
        status: !row.is_active
          ? "inactive"
          : row.moderation_status === "pending"
          ? "pending"
          : Number(row.stock_qty ?? 10) <= 2
          ? "low_stock"
          : "active",
        image: row.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
        salesCount: parseInt(String(row.sales_count).replace(/[^0-9]/g, "")) || 0,
        rating: Number(row.rating || 5),
      }));
      setProducts(mapped);
    } catch (err: any) {
      console.error("Error loading vendor products:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const categories = [
    "الإلكترونيات والأجهزة الذكية",
    "المنزل الذكي والمطبخ العصري",
    "الهواتف الذكية وملحقاتها",
    "الصحة والجمال والعناية الشخصية",
    "اللياقة البدنية والأنشطة الخارجية",
    "الأزياء والموضة والأحذية الرياضية",
  ];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.includes(searchQuery) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || p.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const toggleSelectAll = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map((p) => p.id));
    }
  };

  const toggleSelectProduct = (id: string) => {
    if (selectedProductIds.includes(id)) {
      setSelectedProductIds(selectedProductIds.filter((pId) => pId !== id));
    } else {
      setSelectedProductIds([...selectedProductIds, id]);
    }
  };

  const handleOpenEdit = (p: CatalogProduct) => {
    setEditingProduct(p);
    setNewPrice(p.price);
    setNewStock(p.stock);
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;
    const updatedPrice = Number(newPrice);
    const updatedStock = Number(newStock);

    const { error } = await supabase
      .from("products")
      .update({
        price: updatedPrice,
        stock_qty: updatedStock,
        stock_status: updatedStock === 0 ? "out_of_stock" : updatedStock <= 2 ? "low_stock" : "in_stock",
      })
      .eq("id", editingProduct.id);

    if (error) {
      toast.error("فشل حفظ التعديل: " + error.message);
      return;
    }

    setProducts((prev) =>
      prev.map((item) =>
        item.id === editingProduct.id
          ? {
              ...item,
              price: updatedPrice,
              stock: updatedStock,
              status: updatedStock <= 2 ? "low_stock" : item.status === "low_stock" ? "active" : item.status,
            }
          : item
      )
    );
    toast.success(`تم تحديث بيانات المقتنى "${editingProduct.title}" في Supabase بنجاح!`);
    setEditingProduct(null);
  };

  const handleDeleteProduct = async (id: string, title: string) => {
    if (!confirm(`هل أنت متأكد من حذف "${title}"؟`)) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast.error("فشل حذف المنتج: " + error.message);
      return;
    }
    setProducts((prev) => prev.filter((item) => item.id !== id));
    toast.success(`تم حذف "${title}" من الكتالوج بنجاح`);
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "ID,SKU,Title,Category,Price,Stock,Status\n" +
      products.map(p => `"${p.id}","${p.sku}","${p.title}","${p.category}",${p.price},${p.stock},"${p.status}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `souq_catalog_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("تم تصدير ملف الكتالوج بصيغة CSV المتوافقة مع معايير ZATCA");
  };

  const handleBulkActivate = async () => {
    if (selectedProductIds.length === 0) {
      toast.error("يرجى تحديد قطعة واحدة على الأقل");
      return;
    }
    const { error } = await supabase
      .from("products")
      .update({ is_active: true, moderation_status: "approved" })
      .in("id", selectedProductIds);

    if (error) {
      toast.error("فشل التفعيل الجماعي: " + error.message);
      return;
    }

    setProducts((prev) =>
      prev.map((p) => (selectedProductIds.includes(p.id) ? { ...p, status: "active" } : p))
    );
    toast.success(`تم تفعيل ${selectedProductIds.length} منتجات في المتجر`);
    setSelectedProductIds([]);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col">
      <VendorNav />

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 lg:px-8 py-8">
        {/* Header Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
              <Layers className="w-7 h-7 text-[#006948]" />
              استوديو إدارة الكتالوج والمخزون
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              تحكم كامل في مقتنياتك المعروضة، الأسعار، الضرائب المعتمدة، ومستويات المخزون اللحظية.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="rounded-xl border-slate-300 text-xs font-bold"
            >
              <Download className="w-3.5 h-3.5 ml-1.5" />
              تصدير الكتالوج CSV
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info("استيراد الكتالوج متاح عبر ملفات Excel و CSV")}
              className="rounded-xl border-slate-300 text-xs font-bold"
            >
              <Upload className="w-3.5 h-3.5 ml-1.5" />
              استيراد مجمّع
            </Button>

            <Button asChild variant="sovereign" size="sm" className="rounded-xl font-black text-xs">
              <Link href="/vendor/catalog/add" className="flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4" />
                <span>إدراج مقتنى جديد</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-semibold">إجمالي المقتنيات</span>
              <Boxes className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{products.length}</div>
            <span className="text-[11px] text-emerald-700 font-medium">مدرجة في المتجر الرسمي</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-semibold">مقتنيات نشطة ومعتمدة</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-700">
              {products.filter((p) => p.status === "active").length}
            </div>
            <span className="text-[11px] text-slate-400">ظاهرة للعملاء للشراء الفوري</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-semibold">تنبيهات انخفاض المخزون</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-600">
              {products.filter((p) => p.status === "low_stock").length}
            </div>
            <span className="text-[11px] text-amber-600 font-medium">أقل من 3 قطع متبقية</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-semibold">قيد تدقيق الإدارة</span>
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-blue-600">
              {products.filter((p) => p.status === "pending").length}
            </div>
            <span className="text-[11px] text-slate-400">مراجعة وثائق الأصالة</span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث باسم المقتنى أو رمز التخزين (SKU)..."
                className="pr-10 rounded-2xl border-slate-200 text-xs h-10 w-full"
              />
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
              >
                <option value="all">كافة الأقسام</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Tabs Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {[
              { id: "all", label: "الكل" },
              { id: "active", label: "نشط" },
              { id: "low_stock", label: "مخزون منخفض" },
              { id: "pending", label: "قيد المراجعة" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedStatus === tab.id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk Action Strip */}
        {selectedProductIds.length > 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 px-5 mb-4 flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900">
              تم تحديد {selectedProductIds.length} من المقتنيات
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkActivate}
                className="h-8 text-xs bg-white text-emerald-800 border-emerald-300 rounded-xl"
              >
                تفعيل جماعي
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedProductIds([])}
                className="h-8 text-xs bg-white text-slate-600 rounded-xl"
              >
                إلغاء التحديد
              </Button>
            </div>
          </div>
        )}

        {/* Inventory Data Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={
                        selectedProductIds.length > 0 &&
                        selectedProductIds.length === filteredProducts.length
                      }
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 accent-[#006948]"
                    />
                  </th>
                  <th className="p-4">المقتنى والتصنيف</th>
                  <th className="p-4">رمز التخزين SKU</th>
                  <th className="p-4">السعر شامل ZATCA</th>
                  <th className="p-4">المخزون المتوفر</th>
                  <th className="p-4">الحالة والاعتماد</th>
                  <th className="p-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => {
                  const isChecked = selectedProductIds.includes(p.id);
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isChecked ? "bg-emerald-50/40" : ""
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectProduct(p.id)}
                          className="rounded border-slate-300 accent-[#006948]"
                        />
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.image}
                            alt={p.title}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <Link
                              href={`/products/${p.id}`}
                              className="font-bold text-slate-900 hover:text-[#006948] transition-colors line-clamp-1 max-w-[280px]"
                            >
                              {p.title}
                            </Link>
                            <span className="text-[11px] text-slate-500 block mt-0.5">
                              {p.category}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-mono font-medium text-slate-600">
                        {p.sku}
                      </td>

                      <td className="p-4 font-bold text-slate-900">
                        <div>
                          <span>{formatSAR(p.price)}</span>
                          <span className="block text-[10px] text-emerald-800 font-normal">
                            شامل ضريبة 15%
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-black ${
                              p.stock <= 2
                                ? "text-amber-600"
                                : p.stock === 0
                                ? "text-rose-600"
                                : "text-slate-800"
                            }`}
                          >
                            {p.stock} قطعة
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        {p.status === "active" && (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 text-[11px]">
                            <CheckCircle2 className="w-3 h-3 ml-1 text-emerald-600" />
                            معتمد ونشط
                          </Badge>
                        )}
                        {p.status === "low_stock" && (
                          <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300 text-[11px]">
                            <AlertTriangle className="w-3 h-3 ml-1 text-amber-600" />
                            مخزون حرج
                          </Badge>
                        )}
                        {p.status === "pending" && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-300 text-[11px]">
                            <Clock className="w-3 h-3 ml-1 text-blue-600" />
                            قيد التدقيق
                          </Badge>
                        )}
                        {p.status === "inactive" && (
                          <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-300 text-[11px]">
                            موقوف
                          </Badge>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            title="تعديل السعر والمخزون"
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <Link
                            href={`/products/${p.id}`}
                            target="_blank"
                            title="معاينة صفحة المنتج للعميل"
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => handleDeleteProduct(p.id, p.title)}
                            title="حذف المقتنى"
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Quick Edit Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#006948]" />
              تعديل السعر والمخزون
            </DialogTitle>
          </DialogHeader>

          {editingProduct && (
            <div className="space-y-4 my-2">
              <div className="p-3 bg-slate-50 rounded-2xl flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={editingProduct.image}
                  alt={editingProduct.title}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div>
                  <h4 className="font-bold text-xs text-slate-900 line-clamp-1">
                    {editingProduct.title}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">
                    SKU: {editingProduct.sku}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  السعر الجديد (ريال سعودي شامل ZATCA 15%):
                </label>
                <Input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  className="rounded-xl text-sm font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  الكمية المتوفرة بالمستودع:
                </label>
                <Input
                  type="number"
                  value={newStock}
                  onChange={(e) => setNewStock(Number(e.target.value))}
                  className="rounded-xl text-sm font-bold"
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:justify-start">
            <Button
              variant="sovereign"
              size="sm"
              onClick={handleSaveEdit}
              className="rounded-xl font-bold text-xs"
            >
              حفظ التعديلات
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingProduct(null)}
              className="rounded-xl text-xs"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <StorefrontFooter />
    </div>
  );
}

