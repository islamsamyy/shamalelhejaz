"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ShieldCheck } from "lucide-react";
import { formatSAR } from "@/lib/utils";

export default function CartDrawer() {
  const {
    cart,
    cartCount,
    subtotal,
    taxAmount,
    total,
    removeFromCart,
    updateQuantity,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
  } = useCart();
  const { currency } = useCurrency();

  return (
    <Sheet open={isCartDrawerOpen} onOpenChange={setIsCartDrawerOpen}>
      <SheetContent side="left" className="w-full sm:max-w-md flex flex-col p-0">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#006948] flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <SheetTitle className="text-base font-bold text-slate-900">
                سلة المقتنيات الملكية
              </SheetTitle>
              <p className="text-xs text-slate-500">
                {cartCount > 0
                  ? `${cartCount} قطع مخصصة في حجز الضمان`
                  : "سلتك فارغة حالياً"}
              </p>
            </div>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                لا توجد مقتنيات في الحقيبة
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                استكشف خزانة المقتنيات السيادية ودهن العود النادر وأضف ما يناسب ذوقك الرفيع.
              </p>
              <Button
                asChild
                variant="sovereign"
                className="mt-6"
                onClick={() => setIsCartDrawerOpen(false)}
              >
                <Link href="/catalog">تصفح دليل المقتنيات</Link>
              </Button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-3.5 rounded-2xl border border-slate-200/70 bg-white hover:border-emerald-300 transition-all shadow-xs"
              >
                {/* Thumbnail */}
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-semibold text-emerald-700">
                        {item.vendor}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="حذف القطعة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 line-clamp-1 mt-0.5">
                      {item.title}
                    </h5>
                    <p className="text-xs font-bold text-[#006948] mt-1">
                      {formatSAR(item.price)}
                    </p>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-md bg-white text-slate-700 flex items-center justify-center hover:bg-slate-200 text-xs shadow-xs transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold px-2 text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-md bg-white text-slate-700 flex items-center justify-center hover:bg-slate-200 text-xs shadow-xs transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-[11px] font-medium text-slate-400">
                      الإجمالي: {formatSAR(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer & Checkout Summary */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-slate-200/80 bg-slate-50/70 space-y-4">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>المجموع الفرعي:</span>
                <span className="font-semibold text-slate-900">{formatSAR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>ضريبة القيمة المضافة ZATCA (15%):</span>
                <span className="font-semibold text-emerald-800">{formatSAR(taxAmount)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>الإجمالي النهائي (شامل الضريبة):</span>
                <span className="text-[#006948] text-base">{formatSAR(total)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50 text-[11px] text-emerald-800 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>مؤمّن بضمان البنك المركزي السعودي (ساما)</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <Button
                asChild
                variant="outline"
                onClick={() => setIsCartDrawerOpen(false)}
              >
                <Link href="/cart">عرض الحقيبة كاملة</Link>
              </Button>
              <Button
                asChild
                variant="sovereign"
                onClick={() => setIsCartDrawerOpen(false)}
              >
                <Link href="/checkout" className="flex items-center gap-1.5 justify-center">
                  <span>إتمام الطلب</span>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
