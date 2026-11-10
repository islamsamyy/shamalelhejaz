"use client";

import React, { useState } from "react";
import Link from "next/link";
import StorefrontHeader from "@/components/StorefrontHeader";
import StorefrontFooter from "@/components/StorefrontFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useCart } from "@/context/CartContext";
import {
  User,
  ShoppingBag,
  Heart,
  MapPin,
  Wallet,
  Settings,
  ShieldCheck,
  Clock,
  ArrowLeft,
  ChevronLeft,
  Plus,
  Trash2,
  Download,
  CreditCard,
  Lock,
  Sparkles,
} from "lucide-react";
import { formatSAR } from "@/lib/utils";
import { toast } from "sonner";

export default function CustomerAccountDashboardPage() {
  const { wishlist, cart } = useCart();
  const [activeTab, setActiveTab] = useState("overview");

  // Add Address Modal state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addresses, setAddresses] = useState([
    {
      id: "addr-1",
      title: "المقر الدبلوماسي الرئيسي (الرياض)",
      name: "صاحب السمو الأمير فهد آل سعود",
      city: "الرياض",
      district: "حي السفارات",
      building: "مبنى 7421",
      splCode: "RRRD2914",
      isDefault: true,
    },
    {
      id: "addr-2",
      title: "قصر الكورنيش (جدة)",
      name: "صاحب السمو الأمير فهد آل سعود",
      city: "جدة",
      district: "حي الشاطئ",
      building: "فيلا 12",
      splCode: "JEDW8192",
      isDefault: false,
    },
  ]);

  const [newAddr, setNewAddr] = useState({
    title: "",
    name: "",
    city: "الرياض",
    district: "",
    building: "",
    splCode: "",
  });

  // Wallet Top-up state
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState(124500);
  const [topupAmount, setTopupAmount] = useState(10000);

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.title || !newAddr.district) {
      toast.error("يرجى ملء تفاصيل العنوان الوطني سبل.");
      return;
    }
    setAddresses([
      ...addresses,
      {
        id: `addr-${Date.now()}`,
        ...newAddr,
        name: newAddr.name || "صاحب السمو الأمير فهد آل سعود",
        isDefault: false,
      },
    ]);
    setIsAddressModalOpen(false);
    setNewAddr({ title: "", name: "", city: "الرياض", district: "", building: "", splCode: "" });
    toast.success("تم تسجيل العنوان الوطني الجديد بنجاح!");
  };

  const handleTopup = (e: React.FormEvent) => {
    e.preventDefault();
    setWalletBalance((prev) => prev + Number(topupAmount));
    setIsWalletModalOpen(false);
    toast.success(`تم شحن المحفظة السيادية بمبلغ ${formatSAR(Number(topupAmount))} بنجاح عبر مدى!`);
  };

  const orders = [
    {
      id: "SQ-94281",
      date: "٩ نوفمبر ٢٠٢٦",
      total: 48500,
      status: "جاري التجهيز والتغليف الملكي",
      badge: "توصيل ساعتان VIP",
      itemTitle: "ساعة الصقر الكرونوغراف KSA-01 المرصعة",
      vendor: "دار الحرمين للساعات",
    },
    {
      id: "SQ-89104",
      date: "٢٨ أكتوبر ٢٠٢٦",
      total: 12500,
      status: "تم التسليم بنجاح",
      badge: "مكتمل",
      itemTitle: "دهن عود ملكي معتق ٦٠ عاماً",
      vendor: "بيت العود المعتق",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col">
      <StorefrontHeader />

      <main className="flex-1 pt-32 lg:pt-36">
        {/* Profile Hero Header */}
        <section className="bg-white border-b border-slate-200/80 py-8">
          <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#006948] to-[#004d34] text-white flex items-center justify-center font-black text-2xl shadow-lg ring-4 ring-emerald-500/20">
                  ف
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                      صاحب السمو الأمير / فهد بن خالد آل سعود
                    </h1>
                    <Badge variant="sovereign">عضوية الدرجة الملكية VIP</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    المعرف السيادي: #KSA-ROYAL-0042 • توثيق نفاذ الوطني: معتمد بنسبة 100%
                  </p>
                </div>
              </div>

              {/* Quick Wallet & SAMA Status */}
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#006948] flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <div className="text-start">
                  <span className="text-[11px] text-slate-500 block">رصيد المحفظة السيادية</span>
                  <span className="text-base font-black text-[#006948]">{formatSAR(walletBalance)}</span>
                </div>
                <Button size="sm" variant="outline" className="ms-3 font-bold text-xs" onClick={() => setIsWalletModalOpen(true)}>
                  شحن الرصيد
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard 2-Column Multi-View Section */}
        <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Sidebar Navigation (3 Cols) */}
            <aside className="lg:col-span-3 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-1.5">
              {[
                { id: "overview", label: "نظرة عامة والديوان", icon: User },
                { id: "orders", label: "سجل الطلبات والمقتنيات", icon: ShoppingBag, count: orders.length },
                { id: "addresses", label: "العناوين الوطنية (SPL)", icon: MapPin, count: addresses.length },
                { id: "wallet", label: "المحفظة وحساب الضمان", icon: Wallet },
                { id: "settings", label: "إعدادات الأمان ونفاذ", icon: Settings },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-colors cursor-pointer ${
                      isActive
                        ? "bg-[#006948] text-white shadow-md shadow-[#006948]/20"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </div>
                    {tab.count !== undefined && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}

              <div className="pt-4 border-t border-slate-100 mt-2 space-y-2">
                <Button asChild variant="outline" size="sm" className="w-full text-xs font-bold justify-start">
                  <Link href="/wishlist" className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>المقتنيات المفضلة ({wishlist.length})</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="w-full text-xs font-bold justify-start">
                  <Link href="/vendor" className="flex items-center gap-2 text-emerald-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>بوابة التجار B2B</span>
                  </Link>
                </Button>
              </div>
            </aside>

            {/* Main Content Area (9 Cols) */}
            <div className="lg:col-span-9 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-md">
              {/* Tab 1: Overview */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">ديوان المقتني العام</h2>
                    <p className="text-xs text-slate-500">نظرة شاملة على نشاطك ومقتنياتك الموثقة والضمانات البنكية.</p>
                  </div>

                  {/* 3 Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                      <span className="text-[11px] font-bold text-emerald-800 block mb-1">الرصيد المتاح بالمحفظة</span>
                      <span className="text-2xl font-black text-[#006948]">{formatSAR(walletBalance)}</span>
                      <span className="text-[10px] text-emerald-600 block mt-1">مؤمن في ساما</span>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-600 block mb-1">إجمالي المقتنيات المكتسبة</span>
                      <span className="text-2xl font-black text-slate-900">١٤ مقتنى</span>
                      <span className="text-[10px] text-slate-400 block mt-1">بشهادات أصالة مشفرة</span>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-600 block mb-1">الشحنات النشطة حالياً</span>
                      <span className="text-2xl font-black text-[#006948]">١ شحنة</span>
                      <span className="text-[10px] text-slate-400 block mt-1">توصيل ساعتان فوري</span>
                    </div>
                  </div>

                  {/* Recent Active Order Preview */}
                  <div className="p-5 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-slate-900">أحدث شحنة قيد التجهيز: SQ-94281</span>
                      </div>
                      <Badge variant="sovereign">جاري التجهيز والتغليف الملكي</Badge>
                    </div>

                    <p className="text-xs text-slate-600">
                      ساعة الصقر الكرونوغراف KSA-01 - إصدار قصر اليمامة المرصع (دار الحرمين للساعات)
                    </p>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs font-black text-[#006948]">{formatSAR(48500)}</span>
                      <Button asChild variant="sovereign" size="sm" className="font-bold">
                        <Link href="/orders/SQ-94281/tracking">متابعة التتبع اللحظي</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Orders */}
              {activeTab === "orders" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">سجل الطلبات والمقتنيات</h2>
                    <p className="text-xs text-slate-500">سجل فواتيرك الضريبية ZATCA وحالات الشحن المباشرة.</p>
                  </div>

                  <div className="space-y-4">
                    {orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-5 rounded-2xl border border-slate-200/80 hover:border-emerald-200 transition-all space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                          <div>
                            <span className="text-xs font-black text-slate-900 font-mono">{ord.id}</span>
                            <span className="text-xs text-slate-400 ms-2">• {ord.date}</span>
                          </div>
                          <Badge variant="sovereign">{ord.status}</Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{ord.itemTitle}</h4>
                            <span className="text-[11px] text-emerald-800">{ord.vendor}</span>
                          </div>
                          <span className="text-sm font-black text-[#006948]">{formatSAR(ord.total)}</span>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                          <Button asChild variant="outline" size="sm" className="font-bold text-xs">
                            <Link href={`/orders/${ord.id}/confirmation`}>عرض الفاتورة الضريبية ZATCA</Link>
                          </Button>
                          <Button asChild variant="sovereign" size="sm" className="font-bold text-xs">
                            <Link href={`/orders/${ord.id}/tracking`}>تتبع الشحنة SPL</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Addresses */}
              {activeTab === "addresses" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-black text-slate-900">العناوين الوطنية المعتمدة (SPL)</h2>
                      <p className="text-xs text-slate-500">العناوين المسجلة للتوصيل المصفح الفوري.</p>
                    </div>
                    <Button
                      variant="sovereign"
                      size="sm"
                      onClick={() => setIsAddressModalOpen(true)}
                      className="gap-1.5 font-bold"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة عنوان وطني</span>
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-2 relative"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-900">{addr.title}</span>
                          {addr.isDefault && <Badge variant="sovereign" className="text-[10px]">الرئيسي</Badge>}
                        </div>
                        <p className="text-xs text-slate-600 font-medium">{addr.name}</p>
                        <p className="text-xs text-slate-500">
                          {addr.city} - {addr.district}، {addr.building}
                        </p>
                        <div className="pt-2 text-[11px] font-mono font-bold text-emerald-800">
                          الرمز البريدي سبل: {addr.splCode}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: Wallet */}
              {activeTab === "wallet" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">المحفظة السيادية وحساب الضمان</h2>
                    <p className="text-xs text-slate-500">رصيدك المالي المودع بإشراف البنك المركزي السعودي (ساما).</p>
                  </div>

                  <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-[#004d34] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div>
                      <span className="text-xs text-slate-300 font-bold block mb-1">الرصيد المتاح للشراء الفوري</span>
                      <span className="text-3xl font-black text-white">{formatSAR(walletBalance)}</span>
                      <span className="text-xs text-emerald-300 block mt-1">حساب مؤمن ومحمي رقمياً بنظام TLS 1.3</span>
                    </div>

                    <Button variant="gold" size="lg" onClick={() => setIsWalletModalOpen(true)} className="font-black">
                      شحن المحفظة عبر مدى
                    </Button>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50 text-xs text-emerald-900 border border-emerald-100 flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>ميزة الضمان السيادي تضمن استرداد أموالك كاملة في حال عدم مطابقة المقتنى لشهادة الأصالة.</span>
                  </div>
                </div>
              )}

              {/* Tab 5: Settings */}
              {activeTab === "settings" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">إعدادات الأمان ونفاذ الموحد</h2>
                    <p className="text-xs text-slate-500">إدارة التوثيق الحكومي وكلمة المرور وتنبيهات المزادات.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">توثيق نفاذ الوطني الموحد</h4>
                        <p className="text-[11px] text-slate-500">حسابك مرتبط بالهوية الوطنية عبر مركز المعلومات الوطني.</p>
                      </div>
                      <Badge variant="sovereign">موثق بنجاح ✓</Badge>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">المصادقة الثنائية (2FA) عبر الرسائل النصية</h4>
                        <p className="text-[11px] text-slate-500">إرسال رمز تحقق OTP عند تسجيل الدخول أو إتمام الشراء.</p>
                      </div>
                      <Badge variant="sovereign">مفعل</Badge>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <Button
                        variant="outline"
                        onClick={() => toast.success("تم إرسال رابط تحديث كلمة المرور إلى بريدك المسجل.")}
                        className="font-bold text-xs"
                      >
                        تغيير كلمة المرور
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Add Address Modal Dialog */}
      <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
        <DialogContent className="max-w-md text-start">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">إضافة عنوان وطني سبل جديد</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              أدخل بيانات العنوان الوطني المعتمد بالمملكة.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddAddress} className="space-y-3 my-2">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">تسمية العنوان (مثل: المقر الرئيسي)</label>
              <Input
                value={newAddr.title}
                onChange={(e) => setNewAddr({ ...newAddr, title: e.target.value })}
                placeholder="قصر الدرعية / المقر الصيفي..."
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">المدينة</label>
              <Input
                value={newAddr.city}
                onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                placeholder="الرياض / مكة المكرمة..."
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">الحي</label>
              <Input
                value={newAddr.district}
                onChange={(e) => setNewAddr({ ...newAddr, district: e.target.value })}
                placeholder="اسم الحي السكني"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">رقم المبنى</label>
              <Input
                value={newAddr.building}
                onChange={(e) => setNewAddr({ ...newAddr, building: e.target.value })}
                placeholder="مبنى 10"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">رمز العنوان الوطني سبل المختصر</label>
              <Input
                value={newAddr.splCode}
                onChange={(e) => setNewAddr({ ...newAddr, splCode: e.target.value })}
                placeholder="RRRD2914"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddressModalOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" variant="sovereign">
                حفظ العنوان
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Wallet Top-up Modal Dialog */}
      <Dialog open={isWalletModalOpen} onOpenChange={setIsWalletModalOpen}>
        <DialogContent className="max-w-md text-start">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">شحن المحفظة السيادية</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              الدفع المباشر المشفر عبر مدى أو الحساب البنكي المعتمد من ساما.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleTopup} className="space-y-4 my-2">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">المبلغ المراد شحنه (ر.س)</label>
              <Input
                type="number"
                value={topupAmount}
                onChange={(e) => setTopupAmount(Number(e.target.value))}
                min={1000}
                step={1000}
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[5000, 10000, 50000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTopupAmount(amt)}
                  className={`p-2 rounded-xl text-xs font-bold border ${
                    topupAmount === amt ? "border-[#006948] bg-emerald-50 text-emerald-900" : "border-slate-200"
                  }`}
                >
                  +{amt} ر.س
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsWalletModalOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" variant="sovereign">
                تأكيد الشحن الفوري
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <StorefrontFooter />
    </div>
  );
}
