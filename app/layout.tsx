import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import CartDrawer from "@/components/CartDrawer";
import PlatformNavigator from "@/components/PlatformNavigator";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "شمال الحجاز | منصة المتاجر والموردين المعتمدين - تسوق المنتجات الأكثر مبيعاً بأفضل الأسعار",
    template: "%s | شمال الحجاز",
  },
  description:
    "شمال الحجاز: المنصة السعودية الرائدة للتجارة الإلكترونية متعددة البائعين. تسوق المنتجات الأكثر مبيعاً في الإلكترونيات، الهواتف، المنزل الذكي، الصحة والجمال، والأزياء مباشرة من الموردين المعتمدين بأسعار الجملة، مع حماية المشتري وشحن فوري خلال ٢٤ ساعة.",
  keywords: [
    "شمال الحجاز",
    "متجر شمال الحجاز",
    "منصة شمال الحجاز للتجارة",
    "متجر إلكتروني متعدد التجار",
    "المنتجات الأكثر مبيعاً",
    "تسوق أونلاين السعودية",
    "إلكترونيات ذكية أصلية",
    "أجهزة منزلية ذكية",
    "شراء هواتف ذكية",
    "منصة بائعين موثوقة",
    "عروض وتخفيضات اليوم",
    "حماية المشتري والضمان البنكي",
  ],
  authors: [{ name: "فريق منصة شمال الحجاز للتجارة الإلكترونية" }],
  creator: "شمال الحجاز",
  publisher: "شمال الحجاز لتقنية المعلومات والتجارة الإلكترونية",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://shamalalhijaz.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "شمال الحجاز | منصة المتاجر والموردين المعتمدين - تسوق أفضل المنتجات مبيعاً",
    description:
      "اكتشف آلاف المنتجات الأكثر مبيعاً من كبار الموردين والمصنعين مباشرة على منصة شمال الحجاز. أسعار منافسة، ضمان أصالة 100%، وحماية مالية للمشتري مع توصيل فوري.",
    url: "https://shamalalhijaz.com",
    siteName: "شمال الحجاز - Shamal Al-Hijaz",
    locale: "ar_SA",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80",
        width: 1200,
        height: 630,
        alt: "شمال الحجاز - منصة المتاجر والموردين المعتمدين",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "شمال الحجاز | منصة المتاجر والموردين المعتمدين",
    description:
      "تسوق أفضل المنتجات مبيعاً في الإلكترونيات والأجهزة والجمال مباشرة من التجار المعتمدين بضمان وأسعار منافسة على شمال الحجاز.",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80",
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/logo-mark.png", type: "image/png" },
    ],
    apple: [
      { url: "/logo-square.png", type: "image/png" },
    ],
    shortcut: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://shamalalhijaz.com/#organization",
        name: "شمال الحجاز - Shamal Al-Hijaz",
        url: "https://shamalalhijaz.com",
        logo: "https://shamalalhijaz.com/logo.png",
        sameAs: [
          "https://twitter.com/shamal_alhijaz",
          "https://instagram.com/shamal_alhijaz",
        ],
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+966-800-123-7687",
          contactType: "customer service",
          areaServed: ["SA", "AE", "KW", "BH", "QA", "OM"],
          availableLanguage: ["Arabic", "English"],
        },
      },
      {
        "@type": "WebSite",
        "@id": "https://shamalalhijaz.com/#website",
        url: "https://shamalalhijaz.com",
        name: "شمال الحجاز - منصة المتاجر والموردين المعتمدين",
        description:
          "المنصة الرائدة للتجارة الإلكترونية متعددة البائعين. تسوق المنتجات الأكثر مبيعاً بأسعار المورد المباشرة مع حماية المشتري وضمان الأصالة.",
        publisher: { "@id": "https://shamalalhijaz.com/#organization" },
        potentialAction: {
          "@type": "SearchAction",
          target: "https://shamalalhijaz.com/search?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <html lang="ar" dir="rtl" className="scroll-smooth" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className="min-h-screen bg-[#f8fafc] text-[#0f172a] antialiased selection:bg-emerald-100 selection:text-emerald-900 font-sans"
        suppressHydrationWarning
      >
        <LanguageProvider>
          <CurrencyProvider>
            <CartProvider>
              {children}
              <CartDrawer />
              <PlatformNavigator />
              <Toaster
                position="top-center"
                richColors
                theme="light"
                toastOptions={{
                  className: "font-sans text-xs rounded-2xl shadow-xl border border-slate-200",
                }}
              />
            </CartProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
