"use client";

import React, { useState } from "react";
import Link from "next/link";
import StorefrontHeader from "@/components/StorefrontHeader";
import StorefrontFooter from "@/components/StorefrontFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RotateCcw, ShieldCheck, CheckCircle2, ChevronLeft, Upload, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function ReturnsPortalPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("damaged");
  const [refundMethod, setRefundMethod] = useState("wallet");
  const [notes, setNotes] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      toast.error("يرجى إدخال رقم الطلب المعتمد.");
      return;
    }
    setIsSubmitted(true);
    toast.success("تم تسجيل طلب الاسترجاع بنجاح، سيصلك مندوب الكونسيرج لاستلام القطعة.");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col">
      <StorefrontHeader />

      <main className="flex-1 pt-32 lg:pt-36">
        <section className="bg-white border-b border-slate-200/80 py-8">
          <div className="max-w-[1000px] mx-auto px-4 lg:px-8">
            <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2">
              <Link href="/" className="hover:text-[#006948] transition-colors">الرئيسية</Link>
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="text-[#006948] font-bold">بوابة الإرجاع والاسترداد الميسر</span>
            </nav>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#006948] flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900">
                  بوابة الإرجاع الذاتي والاسترداد المالي
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  خدمة سيادية تضمن فحص واسترجاع القطعة دون أي رسوم مع استرداد المبلغ فوراً لحسابك.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-[1000px] mx-auto px-4 lg:px-8 py-8">
          {isSubmitted ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-md max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#006948] flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">تم تسجيل طلب الاسترجاع بنجاح</h3>
              <p className="text-xs text-slate-500 mt-2 mb-6 leading-relaxed">
                رقم طلب الاسترجاع: <span className="font-mono font-bold text-[#006948]">RET-74910</span>. سيقوم مندوبنا الأمني بالتواصل معك خلال ساعتين لتحديد موعد استلام القطعة في عبوتها الرسمية.
              </p>
              <Button asChild variant="sovereign">
                <Link href="/">العودة للمتجر الرئيسي</Link>
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-md">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">رقم الطلب السيادي</label>
                    <Input
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      placeholder="SQ-94281"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">رقم الجوال المسجل بالطلب</label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="05XXXXXXXX"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">سبب الاسترجاع</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#006948]"
                  >
                    <option value="damaged">المقتنى به عيب مصنعي أو كسر أثناء الشحن</option>
                    <option value="mismatch">المقتنى لا يطابق المواصفات أو المقاس المطلوب</option>
                    <option value="mind-change">تغيير الرغبة الشخصية (ضمن مهلة الـ ٧ أيام الملكية)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">طريقة استرداد المبلغ</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label
                      onClick={() => setRefundMethod("wallet")}
                      className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer ${
                        refundMethod === "wallet" ? "border-[#006948] bg-emerald-50 text-emerald-900 font-bold" : "border-slate-200 text-slate-600"
                      }`}
                    >
                      <span className="text-xs">إيداع فوري في المحفظة السيادية</span>
                      <input type="radio" checked={refundMethod === "wallet"} onChange={() => setRefundMethod("wallet")} className="accent-[#006948]" />
                    </label>

                    <label
                      onClick={() => setRefundMethod("bank")}
                      className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer ${
                        refundMethod === "bank" ? "border-[#006948] bg-emerald-50 text-emerald-900 font-bold" : "border-slate-200 text-slate-600"
                      }`}
                    >
                      <span className="text-xs">استرجاع لحساب البطاقة البنكية</span>
                      <input type="radio" checked={refundMethod === "bank"} onChange={() => setRefundMethod("bank")} className="accent-[#006948]" />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">ملاحظات إضافية</label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="وضح أي تفاصيل ترغب في إبلاغ كونسيرج الفحص بها..."
                  />
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <Button type="submit" variant="sovereign" size="lg" className="font-bold">
                    إرسال طلب الاسترجاع
                  </Button>
                </div>
              </form>
            </div>
          )}
        </section>
      </main>

      <StorefrontFooter />
    </div>
  );
}

