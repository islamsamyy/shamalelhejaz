"use client";

import React, { createContext, useContext, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export interface CartItem {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  vendor: string;
  quantity: number;
  category?: string;
  badge?: string;
}

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  subtotal: number;
  taxAmount: number;
  discount: number;
  couponCode: string;
  total: number;
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => boolean;
  wishlist: string[];
  toggleWishlist: (item: { id: string; title: string }) => void;
  isWishlisted: (id: string) => boolean;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
}

const defaultCart: CartItem[] = [
  {
    id: "sony-wh1000xm5",
    title: "سماعات رأس لاسلكية سوني WH-1000XM5 عازلة للضوضاء النشطة ANC",
    price: 1399,
    originalPrice: 1699,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    vendor: "التقنية الحديثة للموزعين المعتمدين",
    quantity: 1,
    category: "الإلكترونيات والأجهزة الذكية",
    badge: "الأكثر مبيعاً #1",
  },
  {
    id: "ninja-dualzone-airfryer",
    title: "قلاية هوائية رقمية ذكية نينجا دوال زون سعة 9.5 لتر",
    price: 799,
    originalPrice: 1099,
    image: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=600&auto=format&fit=crop&q=80",
    vendor: "هوم إلكترونيكس ستور",
    quantity: 1,
    category: "المنزل الذكي والمطبخ العصري",
    badge: "الأكثر طلباً",
  },
  {
    id: "stanley-quencher-tumbler-40oz",
    title: "كوب ستانلي كوينشر H2.0 الحراري العازل 40 أونصة",
    price: 219,
    originalPrice: 289,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80",
    vendor: "أوت دور فنتشرز لمعدات الرحلات واللياقة",
    quantity: 1,
    category: "اللياقة البدنية والأنشطة الخارجية",
    badge: "تريند 2026",
  },
];

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(defaultCart);
  const [wishlist, setWishlist] = useState<string[]>([
    "falcon-chronograph",
    "pure-taif-rose",
  ]);
  const [couponCode, setCouponCode] = useState<string>("");
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = Math.round((subtotal * discountPercent) / 100);
  const taxableAmount = Math.max(0, subtotal - discount);
  const taxAmount = Math.round(taxableAmount * 0.15); // ZATCA 15% VAT
  const total = taxableAmount + taxAmount;

  const addToCart = (item: Omit<CartItem, "quantity">, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { ...item, quantity }];
    });

    toast.success(`تمت إضافة "${item.title}" إلى حقيبة المقتنيات`, {
      description: "تم تحديث سلتك بنجاح مع ضمان الحجز السيادي.",
      action: {
        label: "عرض السلة",
        onClick: () => setIsCartDrawerOpen(true),
      },
    });
  };

  const removeFromCart = (id: string) => {
    const item = cart.find((i) => i.id === id);
    setCart((prev) => prev.filter((i) => i.id !== id));
    if (item) {
      toast.info(`تم حذف "${item.title}" من السلة`, {
        description: "تم تحرير حجز القطعة للمشترين الآخرين.",
      });
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const applyCoupon = (code: string): boolean => {
    const normalized = code.trim().toUpperCase();
    if (normalized === "VISION2030" || normalized === "SOUQ2030" || normalized === "SOUQ10") {
      setCouponCode(normalized);
      setDiscountPercent(10);
      toast.success("تم تفعيل كود الخصم بنجاح!", {
        description: "تم تطبيق خصم 10% على إجمالي سلة المشتريات.",
      });
      return true;
    } else if (normalized === "ROYAL15" || normalized === "TECH15") {
      setCouponCode(normalized);
      setDiscountPercent(15);
      toast.success("تم تفعيل كود الخصم الحصري بنجاح!", {
        description: "تم تطبيق خصم 15% على المشتريات.",
      });
      return true;
    } else {
      // Lookup real coupons from Supabase database
      supabase
        .from("coupons")
        .select("*")
        .eq("code", normalized)
        .eq("is_active", true)
        .maybeSingle()
        .then(({ data, error }) => {
          if (data && !error) {
            const val = Number(data.discount_value || 10);
            setCouponCode(normalized);
            setDiscountPercent(val);
            toast.success(`تم تفعيل كود الخصم (${normalized}) بنجاح!`, {
              description: `تم تطبيق خصم ${val}% على إجمالي سلة المشتريات.`,
            });
          } else {
            toast.error("رمز القسيمة غير صالح أو منتهي الصلاحية", {
              description: "يرجى التحقق من صحة الرمز والمحاولة مجدداً.",
            });
          }
        });
      return true;
    }
  };

  const toggleWishlist = (item: { id: string; title: string }) => {
    setWishlist((prev) => {
      const exists = prev.includes(item.id);
      if (exists) {
        toast.info(`تمت إزالة "${item.title}" من المفضلة`);
        return prev.filter((id) => id !== item.id);
      } else {
        toast.success(`تم حفظ "${item.title}" في ديوان المفضلة`, {
          description: "ستصلك تنبيهات فورية عند عروض الخزائن النادرة.",
        });
        return [...prev, item.id];
      }
    });
  };

  const isWishlisted = (id: string) => wishlist.includes(id);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        subtotal,
        taxAmount,
        discount,
        couponCode,
        total,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
        wishlist,
        toggleWishlist,
        isWishlisted,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
