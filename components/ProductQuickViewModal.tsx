"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { notify } from "@/lib/notify";
import { formatSAR } from "@/lib/utils";
import { Product } from "@/lib/catalogData";
import {
  ShoppingBag,
  Heart,
  CheckCircle2,
  Star,
  Plus,
  Minus,
  ShieldCheck,
  Truck,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export interface ProductQuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductQuickViewModal({
  product,
  isOpen,
  onClose,
}: ProductQuickViewModalProps) {
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const { currency } = useCurrency();
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [engravingText, setEngravingText] = useState<string>("");

  useEffect(() => {
    if (product) {
      setActiveImgIdx(0);
      setQuantity(1);
      setSelectedColor(product.colors?.[0] || "الإصدار القياسي الفاخر");
      setEngravingText("");
    }
  }, [product]);

  if (!product) return null;

  const gallery =
    product.images && product.images.length > 0 ? product.images : [product.image];
  const activeImg = gallery[activeImgIdx] || product.image;
  const wishlisted = isWishlisted(product.id);
  const discountPct =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) * 100
        )
      : 0;

  const handleAdd = () => {
    addToCart(
      {
        id: product.id,
        title: engravingText.trim()
          ? `${product.title} (نقش VIP: ${engravingText.trim()})`
          : product.title,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        vendor: product.vendor,
        category: product.category,
        badge: product.badge,
      },
      quantity
    );
    notify.luxury(
      `تمت إضافة "${product.title}" (${quantity})`,
      "جاهز في حقيبة المقتنيات مع ضمان Escrow وحماية زاتكا."
    );
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl rounded-3xl p-0 overflow-hidden border border-slate-200 bg-white shadow-2xl text-start">
        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Right / Gallery Column */}
          <div className="md:col-span-6 bg-slate-50 p-5 flex flex-col justify-between border-b md:border-b-0 md:border-e border-slate-100">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-slate-200/80 shadow-xs">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImg}
                  src={activeImg}
                  alt={product.title}
                  initial={{ opacity: 0.35, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0.35 }}
                  transition={{ duration: 0.22 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              {/* Top Badges */}
              <div className="absolute top-3 end-3 flex flex-col gap-1.5 items-end">
                <Badge
                  variant="sovereign"
                  className="bg-white/95 backdrop-blur-md text-[#006948] shadow-xs text-[10px] font-bold"
                >
                  {product.badge}
                </Badge>
                {discountPct > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-extrabold shadow-sm">
                    وفر {discountPct}%
                  </span>
                )}
              </div>

              {/* Wishlist Toggle */}
              <button
                type="button"
                onClick={() =>
                  toggleWishlist({ id: product.id, title: product.title })
                }
                className={`absolute top-3 start-3 w-9 h-9 rounded-2xl flex items-center justify-center transition-all shadow-md cursor-pointer ${
                  wishlisted
                    ? "bg-rose-50 text-rose-600 border border-rose-200"
                    : "bg-white/90 backdrop-blur-md text-slate-600 hover:text-rose-600"
                }`}
                aria-label="المفضلة"
              >
                <Heart className={`w-4 h-4 ${wishlisted ? "fill-rose-600" : ""}`} />
              </button>
            </div>

            {/* Thumbnail Carousel */}
            {gallery.length > 1 && (
              <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
                {gallery.map((src, idx) => (
                  <button
                    key={src + idx}
                    type="button"
                    onClick={() => setActiveImgIdx(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      activeImgIdx === idx
                        ? "border-[#006948] ring-2 ring-[#006948]/20 scale-105"
                        : "border-slate-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Left / Details Column */}
          <div className="md:col-span-6 p-6 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <DialogHeader className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-[#006948] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {product.vendor}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{product.rating}</span>
                    <span className="text-slate-400 font-normal">
                      ({product.reviews})
                    </span>
                  </div>
                </div>
                <DialogTitle className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                  {product.title}
                </DialogTitle>
              </DialogHeader>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                {product.description}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-2.5 pt-1">
                <span className="text-2xl font-black text-[#006948]">
                  {formatSAR(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-xs text-slate-400 line-through">
                    {formatSAR(product.originalPrice)}
                  </span>
                )}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {product.stockStatus === "low_stock"
                    ? "كمية محدودة بالخزنة"
                    : "متوفر للشحن الفوري"}
                </span>
              </div>

              {/* Color / Edition Selector */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-700 block">
                  الإصدار / اللون المختار:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(product.colors && product.colors.length > 0
                    ? product.colors
                    : ["الإصدار القياسي الفاخر", "إصدار التغليف الملكي"]
                  ).map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setSelectedColor(col)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                        selectedColor === col
                          ? "bg-[#006948] text-white border-[#006948] shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-300"
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional VIP Engraving */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#c5a059]" />
                  <span>نقش إهداء VIP مجاني (اختياري):</span>
                </label>
                <input
                  type="text"
                  maxLength={24}
                  value={engravingText}
                  onChange={(e) => setEngravingText(e.target.value)}
                  placeholder="أدخل الاسم أو العبارة المراد نقشها..."
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#006948] text-xs outline-none transition-colors"
                />
              </div>

              {/* ZATCA & Delivery Badges */}
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-[11px] text-emerald-900 space-y-1">
                <div className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#006948] shrink-0" />
                  <span>ضريبة القيمة المضافة 15% مشمولة وموثقة عبر زاتكا</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <Truck className="w-3.5 h-3.5 text-[#006948] shrink-0" />
                  <span>{product.deliveryLabel}</span>
                </div>
              </div>
            </div>

            {/* Quantity & Action Row */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">الكمية:</span>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 shadow-2xs cursor-pointer"
                    aria-label="إنقاص الكمية"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-black font-mono text-slate-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 shadow-2xs cursor-pointer"
                    aria-label="زيادة الكمية"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="sovereign"
                  className="flex-1 h-11 rounded-2xl text-xs font-bold shadow-md shadow-[#006948]/20 cursor-pointer"
                  onClick={handleAdd}
                >
                  <ShoppingBag className="w-4 h-4 ms-1.5" />
                  <span>إضافة للسلة • {formatSAR(product.price * quantity)}</span>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="h-11 rounded-2xl text-xs font-bold px-4"
                  onClick={onClose}
                >
                  <Link href={`/products/${product.id}`} className="flex items-center gap-1">
                    <span>التفاصيل</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
