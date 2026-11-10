import { toast } from "sonner";

/**
 * Sovereign Notification Utility for Souq Saudiya (Shamal Al-Hijaz).
 * Wraps Sonner with emerald, gold, and ZATCA compliance accents.
 */
export const notify = {
  success: (message: string, description?: string) =>
    toast.success(message, {
      description,
      className:
        "!bg-[#006948] !text-white !border !border-emerald-400/40 shadow-xl",
    }),

  error: (message: string, description?: string) =>
    toast.error(message, {
      description,
      className:
        "!bg-rose-950 !text-white !border !border-rose-500/40 shadow-xl",
    }),

  info: (message: string, description?: string) =>
    toast.message(message, {
      description,
      className:
        "!bg-slate-900 !text-white !border !border-slate-700 shadow-xl",
    }),

  luxury: (message: string, description?: string) =>
    toast.success(message, {
      description: description ?? "تمت المعاملة وفق معايير الضمان السيادي والحماية المصرفية.",
      className:
        "!bg-gradient-to-l !from-[#0f172a] !to-[#004d34] !text-white !border !border-[#c5a059]/60 shadow-2xl",
    }),

  zatca: (message: string, description?: string) =>
    toast.success(message, {
      description:
        description ?? "الفاتورة الضريبية الإلكترونية معتمدة ومشفرة وفق المرحلة الثانية (ZATCA Phase-2).",
      className:
        "!bg-slate-950 !text-emerald-300 !border !border-emerald-500/40 shadow-xl",
    }),
};
