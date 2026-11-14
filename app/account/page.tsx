"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import StorefrontHeader from "@/components/StorefrontHeader";
import StorefrontFooter from "@/components/StorefrontFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
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
  Plus,
  Trash2,
} from "lucide-react";
import { formatSAR } from "@/lib/utils";
import { toast } from "sonner";

interface AddressItem {
  id: string;
  title: string;
  name: string;
  phone: string;
  city: string;
  district: string;
  building: string;
  splCode: string;
  isDefault: boolean;
}

interface OrderRow {
  id: string;
  date: string;
  total: number;
  status: string;
  itemTitle: string;
  vendor: string;
}

export default function CustomerAccountDashboardPage() {
  const { wishlist } = useCart();
  const [activeTab, setActiveTab] = useState("overview");

  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<{ full_name: string; email: string; role: string }>({
    full_name: "مقتني شمال الحجاز",
    email: "",
    role: "customer",
  });
  const [walletBalance, setWalletBalance] = useState(0);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [addresses, setAddresses] = useState<AddressItem[]>([]);

  // Add Address Modal state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [newAddr, setNewAddr] = useState({
    title: "",
    name: "",
    phone: "",
    city: "الرياض",
    district: "",
    building: "",
    splCode: "",
  });

  const loadAccountData = useCallback(async () => {
    const { data: authData } = await supabase.auth.getUser();
    const u = authData.user;
    if (!u) return;
    setUserId(u.id);

    const [profRes, walRes, ordRes, addrRes] = await Promise.all([
      supabase.from("profiles").select("full_name, email, phone, role").eq("id", u.id).maybeSingle(),
      supabase.from("wallets").select("balance").eq("user_id", u.id).maybeSingle(),
      supabase
        .from("orders")
        .select("*, order_items(title, vendor_id)")
        .eq("user_id", u.id)
        .order("created_at", { ascending: false }),
      supabase.from("addresses").select("*").eq("user_id", u.id).order("created_at", { ascending: false }),
    ]);

    if (profRes.data) {
      setProfile({
        full_name: profRes.data.full_name || u.email?.split("@")[0] || "مقتني شمال الحجاز",
        email: profRes.data.email || u.email || "",
        role: profRes.data.role || "customer",
      });
    }
    if (walRes.data) {
      setWalletBalance(Number(walRes.data.balance || 0));
    }
    if (ordRes.data) {
      setOrders(
        ordRes.data.map((o: any) => {
          const items = Array.isArray(o.order_items) && o.order_items.length > 0 ? o.order_items : o.items || [];
          return {
            id: o.id,
            date: o.created_at ? new Date(o.created_at).toLocaleDateString("ar-SA") : "",
            total: Number(o.total || 0),
            status: o.status || "confirmed",
            itemTitle: items.map((it: any) => it.title).join("، ") || `طلب رقم ${o.id}`,
            vendor: items[0]?.vendor_id || "منصة شمال الحجاز",
          };
        })
      );
    }
    if (addrRes.data) {
      setAddresses(
        addrRes.data.map((a: any) => ({
          id: a.id,
          title: a.label || "عنوان وطني",
          name: a.full_name,
          phone: a.phone || "",
          city: a.city,
          district: a.district || "",
          building: a.building || "",
          splCode: a.postal_code || "",
          isDefault: Boolean(a.is_default),
        }))
      );
    }
  }, []);

  useEffect(() => {
    loadAccountData();
  }, [loadAccountData]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    if (!newAddr.title || !newAddr.district) {
      toast.error("يرجى ملء تفاصيل العنوان الوطني سبل.");
      return;
    }

    const { error } = await supabase.from("addresses").insert([
      {
        user_id: userId,
        label: newAddr.title.trim(),
        full_name: (newAddr.name || profile.full_name).trim(),
        phone: (newAddr.phone || "0500000000").trim(),
        city: newAddr.city.trim(),
        district: newAddr.district.trim(),
        building: newAddr.building.trim(),
        postal_code: newAddr.splCode.trim(),
        is_default: addresses.length === 0,
      },
    ]);

    if (error) {
      toast.error(`تعذر حفظ العنوان: ${error.message}`);
      return;
    }

    setIsAddressModalOpen(false);
    setNewAddr({ title: "", name: "", phone: "", city: "الرياض", district: "", building: "", splCode: "" });
    toast.success("تم تسجيل العنوان الوطني الجديد في قاعدة البيانات بنجاح!");
    loadAccountData();
  };

  const handleDeleteAddress = async (id: string) => {
    const { error } = await supabase.from("addresses").delete().eq("id", id);
    if (error) {
      toast.error(`تعذر حذف العنوان: ${error.message}`);
      return;
    }
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    toast.success("تم حذف العنوان.");
  };

  const activeOrder = orders[0];

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
                  {profile.full_name.slice(0, 1)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                      {profile.full_name}
                    </h1>
                    <Badge variant="sovereign">{profile.role}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-mono">
                    {profile.email}
                  </p>
                </div>
              </div>

              {/* Quick Wallet Status */}
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#006948] flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <div className="text-start">
                  <span className="text-[11px] text-slate-500 block">رصيد المحفظة السيادية</span>
                  <span className="text-base font-black text-[#006948]">{formatSAR(walletBalance)}</span>
                </div>
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
                { id: "settings", label: "إعدادات الأمان", icon: Settings },
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
                    <p className="text-xs text-slate-500">نظرة شاملة على نشاطك الفعلي المسجل في قاعدة البيانات.</p>
                  </div>

                  {/* 3 Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                      <span className="text-[11px] font-bold text-emerald-800 block mb-1">الرصيد المتاح بالمحفظة</span>
                      <span className="text-2xl font-black text-[#006948]">{formatSAR(walletBalance)}</span>
                      <span className="text-[10px] text-emerald-600 block mt-1">مؤمن في ساما</span>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-600 block mb-1">إجمالي الطلبات المسجلة</span>
                      <span className="text-2xl font-black text-slate-900">{orders.length} طلب</span>
                      <span className="text-[10px] text-slate-400 block mt-1">مرتبطة بحسابك</span>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-600 block mb-1">العناوين المسجلة</span>
                      <span className="text-2xl font-black text-[#006948]">{addresses.length} عنوان</span>
                      <span className="text-[10px] text-slate-400 block mt-1">العنوان الوطني سبل</span>
                    </div>
                  </div>

                  {/* Recent Active Order Preview */}
                  {activeOrder ? (
                    <div className="p-5 rounded-2xl border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-bold text-slate-900">
                            أحدث طلب: {activeOrder.id}
                          </span>
                        </div>
                        <Badge variant="sovereign">{activeOrder.status}</Badge>
                      </div>

                      <p className="text-xs text-slate-600">{activeOrder.itemTitle}</p>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs font-black text-[#006948]">{formatSAR(activeOrder.total)}</span>
                        <Button asChild variant="sovereign" size="sm" className="font-bold">
                          <Link href={`/orders/${activeOrder.id}/tracking`}>متابعة التتبع اللحظي</Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                      لا توجد طلبات مسجلة في حسابك بعد.
                    </div>
                  )}
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

                    {orders.length === 0 && (
                      <div className="p-8 text-center text-xs text-slate-400">
                        لا توجد طلبات مسجلة حتى الآن.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Addresses */}
              {activeTab === "addresses" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-black text-slate-900">العناوين الوطنية المعتمدة (SPL)</h2>
                      <p className="text-xs text-slate-500">محفوظة في جدول `public.addresses` في قاعدة البيانات.</p>
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
                          <div className="flex items-center gap-1.5">
                            {addr.isDefault && <Badge variant="sovereign" className="text-[10px]">الرئيسي</Badge>}
                            <button
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                              title="حذف العنوان"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
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

                    {addresses.length === 0 && (
                      <div className="col-span-2 p-8 text-center text-xs text-slate-400">
                        لم تقم بإضافة أي عنوان وطني بعد.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 4: Wallet */}
              {activeTab === "wallet" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">المحفظة السيادية وحساب الضمان</h2>
                    <p className="text-xs text-slate-500">رصيدك الفعلي في جدول `public.wallets` المحمي بسياسات RLS.</p>
                  </div>

                  <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-[#004d34] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div>
                      <span className="text-xs text-slate-300 font-bold block mb-1">الرصيد المتاح للشراء الفوري</span>
                      <span className="text-3xl font-black text-white">{formatSAR(walletBalance)}</span>
                      <span className="text-xs text-emerald-300 block mt-1">حساب مؤمن ومحمي رقمياً</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: Settings */}
              {activeTab === "settings" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">إعدادات الأمان</h2>
                    <p className="text-xs text-slate-500">إدارة بيانات حسابك وكلمة المرور عبر Supabase Auth.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        onClick={async () => {
                          if (!profile.email) return;
                          await supabase.auth.resetPasswordForEmail(profile.email);
                          toast.success("تم إرسال رابط تحديث كلمة المرور إلى بريدك المسجل.");
                        }}
                        className="font-bold text-xs"
                      >
                        إرسال رابط تغيير كلمة المرور
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
              أدخل بيانات العنوان الوطني ليتم حفظها في قاعدة البيانات.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddAddress} className="space-y-3 my-2">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">تسمية العنوان</label>
              <Input
                value={newAddr.title}
                onChange={(e) => setNewAddr({ ...newAddr, title: e.target.value })}
                placeholder="المنزل / المكتب..."
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">رقم الجوال</label>
              <Input
                value={newAddr.phone}
                onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                placeholder="05XXXXXXXX"
                dir="ltr"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">المدينة</label>
              <Input
                value={newAddr.city}
                onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                placeholder="الرياض / جدة..."
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">الحي</label>
              <Input
                value={newAddr.district}
                onChange={(e) => setNewAddr({ ...newAddr, district: e.target.value })}
                placeholder="اسم الحي"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">رقم المبنى</label>
              <Input
                value={newAddr.building}
                onChange={(e) => setNewAddr({ ...newAddr, building: e.target.value })}
                placeholder="7421"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">الرمز البريدي</label>
              <Input
                value={newAddr.splCode}
                onChange={(e) => setNewAddr({ ...newAddr, splCode: e.target.value })}
                placeholder="12512"
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

      <StorefrontFooter />
    </div>
  );
}
