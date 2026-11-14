"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  Clock,
  Store,
  Info,
  Lock,
  Globe,
} from "lucide-react";
import { formatSAR } from "@/lib/utils";
import { notify } from "@/lib/notify";
import { fetchClientRole, signOutClient, Role } from "@/lib/rbac";

export default function StorefrontHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount, total, wishlist, setIsCartDrawerOpen } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currencyLabel, setCurrencyLabel] = useState("الريال السعودي (ر.س)");

  useEffect(() => {
    fetchClientRole().then(setCurrentRole);
    const handleScroll = () => setIsScrolled(window.scrollY > 16);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchFocused(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const trendingSearches = [
    "سماعات سوني WH-1000XM5",
    "قلاية نينجا دوال زون",
    "آيفون 16 برو ماكس",
    "كوب ستانلي 40 أونصة",
    "ساعة أبل واتش ألترا 2",
    "مصفف دايسون إير راب",
    "سيروم سكينسوتيكلز C",
    "دامبلز بوفليكس 552",
  ];

  // Pure customer navigation (no admin/internal B2B dashboard clutter)
  const navLinks = [
    { label: "الرئيسية", href: "/" },
    { label: "الأكثر مبيعاً", href: "/catalog" },
    { label: "فهرس الأقسام", href: "/categories" },
    { label: "عروض الخصم الحصرية", href: "/deals" },
    { label: "عن المنصة ومزايانا", href: "/about" },
  ];

  return (
    <TooltipProvider delayDuration={180}>
      <motion.div
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 inset-x-0 z-40 flex flex-col transition-all duration-300 ${
          isScrolled ? "shadow-lg shadow-slate-900/5" : "shadow-xs"
        }`}
      >
      {/* Top Trust Ribbon */}
      <div className="w-full bg-slate-900 text-white text-xs border-b border-slate-800">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 h-9 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold border border-emerald-500/30">
              <Sparkles className="w-3 h-3" />
              شمال الحجاز للمتاجر المعتمدة
            </span>
            <p className="truncate text-slate-300 text-[11px] hidden sm:block">
              تسوق مباشرة من كبار الموردين والمصانع • حماية المشتري بحساب الضمان Escrow • شحن فوري خلال ٢٤ ساعة
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0 text-slate-300 text-[11px]">
            {/* Dynamic Role-Based Switcher in Ribbon */}
            <div className="hidden lg:flex items-center gap-2.5 text-[11px]">
              {currentRole === "admin" && (
                <>
                  <Link
                    href="/admin"
                    className="text-amber-400 hover:text-amber-300 font-bold transition-colors flex items-center gap-1 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>مركز الرقابة والامتثال</span>
                  </Link>
                  <span className="text-slate-700">|</span>
                  <Link
                    href="/portals"
                    className="text-slate-300 hover:text-emerald-400 transition-colors"
                  >
                    <span>البوابات المستقلة</span>
                  </Link>
                  <span className="text-slate-700">|</span>
                </>
              )}

              {currentRole === "vendor" && (
                <>
                  <Link
                    href="/vendor"
                    className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20"
                  >
                    <Store className="w-3.5 h-3.5 text-emerald-400" />
                    <span>لوحة تحكم التاجر</span>
                  </Link>
                  <span className="text-slate-700">|</span>
                </>
              )}

              {/* Public Merchant Onboarding Link for Visitors / Customers */}
              {currentRole !== "vendor" && currentRole !== "admin" && (
                <>
                  <Link
                    href="/vendor/register"
                    className="text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-1 font-medium"
                  >
                    <Store className="w-3.5 h-3.5 text-emerald-400" />
                    <span>انضم كتاجر ومورد (B2B)</span>
                  </Link>
                  <span className="text-slate-700">|</span>
                </>
              )}
            </div>
            <div className="h-3 w-px bg-slate-700 hidden lg:block"></div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors cursor-pointer">
                  <Globe className="w-3.5 h-3.5" />
                  <span>{currencyLabel}</span>
                  <ChevronDown className="w-3 h-3 opacity-80" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 text-start">
                <DropdownMenuLabel className="text-[11px]">العملة والمنطقة</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setCurrencyLabel("الريال السعودي (ر.س)");
                    notify.success("تم اعتماد العملة المحلية: الريال السعودي (SAR)");
                  }}
                >
                  🇸🇦 الريال السعودي (ر.س)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setCurrencyLabel("الدرهم الإماراتي (د.إ)");
                    notify.info("معاينة الأسعار بالدرهم الإماراتي (AED)");
                  }}
                >
                  🇦🇪 الدرهم الإماراتي (د.إ)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setCurrencyLabel("الدولار الأمريكي (USD)");
                    notify.info("معاينة الأسعار بالدولار الأمريكي (USD)");
                  }}
                >
                  🌐 الدولار الأمريكي (USD)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <header
        className={`w-full border-b transition-all duration-300 ${
          isScrolled
            ? "bg-white/85 backdrop-blur-2xl border-slate-200/90"
            : "bg-white/95 backdrop-blur-xl border-slate-200/80"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 h-20 flex items-center justify-between gap-4 md:gap-8">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Mobile Menu Trigger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <button className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100">
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006948] to-[#004d34] flex items-center justify-center text-white font-bold shadow-md">
                      ش
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">شمال الحجاز</h4>
                      <p className="text-[11px] text-emerald-700 font-medium">منصة المتاجر والموردين</p>
                    </div>
                  </div>
                  <nav className="flex flex-col gap-2 pt-6">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                          pathname === link.href
                            ? "bg-emerald-50 text-emerald-800"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                    <div className="pt-4 border-t border-slate-100 mt-2 space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 px-1">بوابات الشركاء</p>
                      <Link
                        href="/vendor"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2.5 rounded-xl text-xs font-bold bg-[#006948] text-white text-center"
                      >
                        بوابة الموردين والتجار B2B
                      </Link>
                      <Link
                        href="/about"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 text-center"
                      >
                        عن المنصة ومزاياها
                      </Link>
                    </div>
                  </nav>
                </div>
                <div className="text-[11px] text-slate-400 text-center">
                  شمال الحجاز للمتاجر المعتمدة © {new Date().getFullYear()}
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#006948] via-[#005a3e] to-[#004d34] flex items-center justify-center text-white shadow-md shadow-[#006948]/20 group-hover:scale-105 transition-transform">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col text-start">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-slate-900 tracking-tight group-hover:text-[#006948] transition-colors">
                    شمال الحجاز
                  </span>
                  <Badge variant="sovereign" className="text-[10px] px-2 py-0">
                    متاجر معتمدة
                  </Badge>
                </div>
                <span className="text-[10px] text-slate-500 font-semibold tracking-wide">
                  المنصة الرائدة للتجارة الإلكترونية متعددة البائعين
                </span>
              </div>
            </Link>
          </div>

          {/* Intelligent E-Commerce Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-xl relative">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
              <Search className="absolute end-4 text-slate-400 w-4 h-4 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                placeholder="ابحث عن المنتجات الأكثر مبيعاً، سماعات، قلايات، هواتف، كوب ستانلي..."
                className="w-full h-11 pe-11 ps-28 bg-slate-50 hover:bg-slate-100/80 focus:bg-white rounded-full border border-slate-200 text-slate-800 text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/10 transition-all shadow-inner"
              />
              <Button
                type="submit"
                variant="sovereign"
                size="sm"
                className="absolute start-1.5 h-8 px-4 rounded-full text-xs font-bold"
              >
                بحث في المتاجر
              </Button>
            </form>

            {/* Autocomplete Dropdown Popover */}
            {isSearchFocused && (
              <div className="absolute top-12 inset-x-0 bg-white border border-slate-200 rounded-3xl shadow-2xl p-4 z-50 animate-in fade-in-0 zoom-in-95">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    المنتجات الأكثر بحثاً الآن
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold">تحديث حي</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => {
                        setSearchQuery(term);
                        router.push(`/search?q=${encodeURIComponent(term)}`);
                      }}
                      className="px-3 py-1.5 rounded-full bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-medium border border-slate-200/80 transition-colors text-start"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Actions & Utility Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Wishlist Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/wishlist"
                  className="relative p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 transition-all hover:scale-105"
                  aria-label="قائمة المفضلة"
                >
                  <Heart className="w-5 h-5" />
                  <AnimatePresence>
                    {wishlist.length > 0 && (
                      <motion.span
                        key={wishlist.length}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 20 }}
                        className="absolute -top-1 -start-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#006948] text-white text-[10px] font-bold shadow-xs"
                      >
                        {wishlist.length}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </TooltipTrigger>
              <TooltipContent>قائمة المفضلة والمقتنيات المحفوظة</TooltipContent>
            </Tooltip>

            {/* Cart Trigger Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setIsCartDrawerOpen(true)}
                  className="flex items-center gap-2.5 px-3.5 sm:px-4 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-sm group cursor-pointer"
                  aria-label="فتح سلة المشتريات"
                >
                  <div className="relative">
                    <ShoppingBag className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <AnimatePresence mode="popLayout">
                      {cartCount > 0 && (
                        <motion.span
                          key={cartCount}
                          initial={{ scale: 0.4, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.4, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 18 }}
                          className="absolute -top-2 -end-2 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#006948] text-white text-[10px] font-bold ring-2 ring-slate-900"
                        >
                          {cartCount}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="hidden sm:flex flex-col text-start leading-tight">
                    <span className="text-[10px] text-slate-400 font-medium">سلة التسوق</span>
                    <span className="text-xs text-white font-bold">{formatSAR(total)}</span>
                  </div>
                </motion.button>
              </TooltipTrigger>
              <TooltipContent>عرض حقيبة المقتنيات والفاتورة الضريبية</TooltipContent>
            </Tooltip>

            {/* User Account Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-100 to-teal-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-xs ring-2 ring-emerald-500/20">
                    {currentRole === "admin" ? "إ" : currentRole === "vendor" ? "ت" : currentRole === "customer" ? "ع" : "د"}
                  </div>
                  <div className="hidden xl:flex flex-col text-start">
                    <span className="text-xs font-bold text-slate-900 leading-none">
                      {currentRole === "admin" ? "لوحة الإدارة" : currentRole === "vendor" ? "بوابة التاجر" : currentRole === "customer" ? "حساب العميل" : "تسجيل الدخول"}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                      {currentRole ? "جلسة موثقة" : "دخول المنظومة"}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 text-start">
                <DropdownMenuLabel>حسابي في شمال الحجاز</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account" className="flex items-center justify-between w-full">
                    <span>لوحة التحكم الشخصية</span>
                    <User className="w-4 h-4 text-slate-400" />
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account?tab=orders" className="flex items-center justify-between w-full">
                    <span>مشترياتي والطلبات</span>
                    <ShoppingBag className="w-4 h-4 text-slate-400" />
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/wishlist" className="flex items-center justify-between w-full">
                    <span>المنتجات المفضلة</span>
                    <Heart className="w-4 h-4 text-slate-400" />
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {currentRole === "admin" && (
                  <>
                    <DropdownMenuLabel className="text-[10px] text-amber-600 font-bold">صلاحيات الإدارة والرقابة</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center justify-between w-full text-slate-900 font-bold bg-amber-50/60">
                        <span>مركز الرقابة والامتثال</span>
                        <ShieldCheck className="w-4 h-4 text-amber-600" />
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/portals" className="flex items-center justify-between w-full text-slate-700">
                        <span>لوحة البوابات الشاملة</span>
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                {currentRole === "vendor" && (
                  <>
                    <DropdownMenuLabel className="text-[10px] text-emerald-600 font-bold">بوابة أعمال التاجر</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href="/vendor" className="flex items-center justify-between w-full text-slate-900 font-bold bg-emerald-50/60">
                        <span>لوحة قيادة المتجر B2B</span>
                        <Store className="w-4 h-4 text-emerald-600" />
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/vendor/catalog" className="flex items-center justify-between w-full text-slate-700">
                        <span>إدارة المنتجات والمخزون</span>
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                {currentRole !== "vendor" && currentRole !== "admin" && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/vendor/register" className="flex items-center justify-between w-full text-slate-800 font-medium">
                        <span>انضم كتاجر ومورد (B2B)</span>
                        <Store className="w-4 h-4 text-emerald-600" />
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                <DropdownMenuItem asChild>
                  <Link href="/about" className="flex items-center justify-between w-full text-slate-700">
                    <span>عن منصة شمال الحجاز ومزاياها</span>
                    <Info className="w-4 h-4 text-slate-400" />
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {currentRole ? (
                  <DropdownMenuItem
                    onClick={async () => {
                      await signOutClient();
                      setCurrentRole(null);
                      notify.success("تم تسجيل الخروج بنجاح.");
                      router.push("/");
                    }}
                    className="flex items-center justify-between w-full text-rose-600 font-bold cursor-pointer"
                  >
                    <span>تسجيل الخروج ({currentRole === "admin" ? "المشرف" : currentRole === "vendor" ? "التاجر" : "العميل"})</span>
                    <Lock className="w-4 h-4 text-rose-500" />
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link href="/auth/login" className="flex items-center justify-between w-full text-emerald-700 font-bold">
                      <span>تسجيل الدخول / إنشاء حساب</span>
                      <User className="w-4 h-4 text-emerald-600" />
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Secondary Subnav (Desktop) */}
        <div className="w-full border-t border-slate-100 bg-white hidden lg:block">
          <div className="max-w-[1400px] mx-auto px-4 lg:px-8 h-11 flex items-center justify-between">
            <nav className="flex items-center gap-7 h-full text-xs font-semibold overflow-x-auto">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`h-full inline-flex items-center px-1 transition-colors shrink-0 ${
                      isActive
                        ? "text-[#006948] font-bold border-b-2 border-[#006948]"
                        : "text-slate-600 hover:text-[#006948]"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>حماية المشتري Escrow وضمان بنكي بإشراف ساما</span>
            </div>
          </div>
        </div>
      </header>
    </motion.div>
    </TooltipProvider>
  );
}
