import React from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminAuthGuard from "@/components/admin/AdminAuthGuard";

export const metadata = {
  title: "مركز الرقابة والامتثال والإدارة المركزية | شمال الحجاز",
  description: "القيادة والرقابة التنفيذية لمنصة شمال الحجاز متعددة البائعين المعتمدة.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-row">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <AdminHeader />
        <main className="flex-1 p-6 lg:p-8">
          <AdminAuthGuard>
            {children}
          </AdminAuthGuard>
        </main>
      </div>
    </div>
  );
}

