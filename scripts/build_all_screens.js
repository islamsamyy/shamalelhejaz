const fs = require('fs');
const path = require('path');
const { htmlToJsx } = require('./htmlToJsx');

const screenConfigs = [
  {
    id: 'c03ba5bdecdb43428d39d0a8fff86071',
    name: 'Storefront & Editorial Hub',
    file: 'c03ba5bdecdb43428d39d0a8fff86071_home.html',
    target: 'souq/app/page.tsx',
    type: 'storefront_main'
  },
  {
    id: '29fbfe030d414222863c093a3fa263a7',
    name: 'Catalog & Intelligent Discovery Suite',
    file: '29fbfe030d414222863c093a3fa263a7_catalog.html',
    target: 'souq/app/catalog/page.tsx',
    type: 'storefront_full'
  },
  {
    id: 'b58b0a9fed2e4612a2c6d0977282b146',
    name: 'تفاصيل المنتج - ساعة الصقر الكرونوغراف الملكية',
    file: 'b58b0a9fed2e4612a2c6d0977282b146_product_detail.html',
    target: 'souq/app/products/[id]/page.tsx',
    type: 'storefront_full'
  },
  {
    id: '45f18a5d963447ed9643782b3b3566ae',
    name: 'سلة المشتريات الفاخرة - سوق السعودية',
    file: '45f18a5d963447ed9643782b3b3566ae_cart.html',
    target: 'souq/app/cart/page.tsx',
    type: 'storefront_full'
  },
  {
    id: 'd23056b925174845aed8d484645bc048',
    name: 'Multi-Step Checkout & Payment Terminal',
    file: 'd23056b925174845aed8d484645bc048_checkout.html',
    target: 'souq/app/checkout/page.tsx',
    type: 'storefront_full'
  },
  {
    id: '4caf9b88c7bf4ab9b1223751af64f130',
    name: 'تأكيد الطلب وتتبع الشحنة المباشر',
    file: '4caf9b88c7bf4ab9b1223751af64f130_order_tracking.html',
    target: 'souq/app/orders/[id]/tracking/page.tsx',
    type: 'storefront_full'
  },
  {
    id: '6d2a91ad55cf41ea964b912a2676529e',
    name: 'لوحة تحكم حساب العميل وسجل الطلبات',
    file: '6d2a91ad55cf41ea964b912a2676529e_customer_dashboard.html',
    target: 'souq/app/account/page.tsx',
    type: 'storefront_full'
  },
  {
    id: 'da237281f13949d1a57c4fce91db05b7',
    name: 'المتجر الرسمي - دار الحرمين للساعات والمجوهرات',
    file: 'da237281f13949d1a57c4fce91db05b7_brand_store.html',
    target: 'souq/app/store/[storeId]/page.tsx',
    type: 'storefront_full'
  },
  {
    id: '24bb90bb4b824f47890c467b1ec55c53',
    name: 'Merchant Vendor Hub & Seller Studio',
    file: '24bb90bb4b824f47890c467b1ec55c53_vendor_hub.html',
    target: 'souq/app/vendor/page.tsx',
    type: 'portal_full'
  },
  {
    id: '480791031546418a941e6954b34d4113',
    name: 'معالج تسجيل وتوثيق التاجر (KYB Registration)',
    file: '480791031546418a941e6954b34d4113_kyb_register.html',
    target: 'souq/app/vendor/register/page.tsx',
    type: 'portal_full'
  },
  {
    id: '8bee6d751a684cd78f11c6a709d6af1b',
    name: 'إدارة الكتالوج وإضافة منتج جديد - بوابة التجار',
    file: '8bee6d751a684cd78f11c6a709d6af1b_vendor_add_product.html',
    target: 'souq/app/vendor/catalog/add/page.tsx',
    type: 'portal_full'
  },
  {
    id: '7e6c36d7a50f40e3b1b1f4c35608ecae',
    name: 'إدارة الطلبات وبوالص الشحن اللوجستية - بوابة التجار',
    file: '7e6c36d7a50f40e3b1b1f4c35608ecae_vendor_orders.html',
    target: 'souq/app/vendor/orders/page.tsx',
    type: 'portal_full'
  },
  {
    id: '407493464be0486dbff237370080de1f',
    name: 'اللوحة المالية والتقارير وحساب التسويات - بوابة التجار',
    file: '407493464be0486dbff237370080de1f_vendor_financials.html',
    target: 'souq/app/vendor/financials/page.tsx',
    type: 'portal_full'
  },
  {
    id: '44655020e1c34555bf0f88bfcca2d07c',
    name: 'لوحة العمليات المركزية والرقابة السيادية',
    file: '44655020e1c34555bf0f88bfcca2d07c_admin_command_center.html',
    target: 'souq/app/admin/page.tsx',
    type: 'portal_full'
  }
];

function convertFile(cfg) {
  const filePath = path.join('d:/SOUQ/stitch_screens', cfg.file);
  const rawHtml = fs.readFileSync(filePath, 'utf8');

  // Strip script tags
  let cleaned = rawHtml.replace(/<script[\s\S]*?<\/script>/gi, '');

  // Extract body content
  let bodyContent = '';
  const bodyMatch = cleaned.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    bodyContent = bodyMatch[1];
  } else {
    bodyContent = cleaned;
  }

  // Convert to JSX
  let jsx = htmlToJsx(bodyContent);

  // Smart Link Remapping:
  // In vendor screens, link navigation
  jsx = jsx.replace(/href="[^"]*vendor[^"]*"/gi, 'href="/vendor"');
  jsx = jsx.replace(/href="[^"]*financial[^"]*"/gi, 'href="/vendor/financials"');
  jsx = jsx.replace(/href="[^"]*catalog[^"]*add[^"]*"/gi, 'href="/vendor/catalog/add"');
  jsx = jsx.replace(/href="[^"]*orders[^"]*"/gi, 'href="/vendor/orders"');
  jsx = jsx.replace(/href="[^"]*kyb[^"]*"/gi, 'href="/vendor/register"');

  // Specific common buttons
  jsx = jsx.replace(/href="#"/g, 'href="javascript:void(0)"');

  // Build target component
  const componentName = cfg.name
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('') || 'ScreenPage';

  const code = `"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ${componentName}Page() {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] relative">
      ${jsx}
    </div>
  );
}
`;

  const outPath = path.join('d:/SOUQ', cfg.target);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, code, 'utf8');
  console.log(`Generated [${cfg.name}] -> ${cfg.target}`);
}

screenConfigs.forEach(convertFile);
console.log('All 14 screens processed successfully!');
