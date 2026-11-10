import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  mapDbProductToProduct,
  mapDbCategoryToCategory,
  fetchProductsFromSupabase,
  fetchProductByIdFromSupabase,
  submitReviewToSupabase,
  supabase,
  DbProductRow,
  DbCategoryRow,
} from "@/lib/supabase";

describe("Backend Data Layer: lib/supabase.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================================================================
  // 1. UNIT TESTS: DTO & ENTITY MAPPING LOGIC (AAA PATTERN)
  // =========================================================================

  describe("mapDbProductToProduct", () => {
    it("should correctly map a complete database row to a Product entity", () => {
      // Arrange
      const rawDbRow: DbProductRow = {
        id: "prod-101",
        title: "سماعات سوني عازلة للضوضاء",
        price: 1399,
        original_price: 1699,
        image: "https://example.com/sony.jpg",
        images: ["https://example.com/sony-1.jpg", "https://example.com/sony-2.jpg"],
        vendor: "التقنية الحديثة",
        vendor_id: "vendor-1",
        vendor_rating: 4.95,
        vendor_verified: true,
        category: "الإلكترونيات",
        category_slug: "electronics",
        rating: 4.9,
        reviews: 240,
        sales_count: "١٥,٠٠٠+ بيعت",
        badge: "الأكثر مبيعاً",
        delivery: "express",
        delivery_label: "توصيل خلال ٢٤ ساعة",
        description: "وصف مفصل للسماعة",
        specs: [{ label: "البطارية", value: "٣٠ ساعة" }],
        features: ["عزل نشط", "صوت عالي الدقة"],
        stock_status: "in_stock",
        materials: ["بلاستيك مرن"],
        colors: ["أسود", "فضي"],
        is_featured: true,
        is_flash_deal: false,
        created_at: new Date().toISOString(),
      };

      // Act
      const result = mapDbProductToProduct(rawDbRow);

      // Assert
      expect(result.id).toBe("prod-101");
      expect(result.title).toBe("سماعات سوني عازلة للضوضاء");
      expect(result.price).toBe(1399);
      expect(result.originalPrice).toBe(1699);
      expect(result.vendor).toBe("التقنية الحديثة");
      expect(result.images).toEqual(["https://example.com/sony-1.jpg", "https://example.com/sony-2.jpg"]);
      expect(result.specs).toEqual([{ label: "البطارية", value: "٣٠ ساعة" }]);
      expect(result.stockStatus).toBe("in_stock");
    });

    it("should provide safe fallbacks for nullable/missing database fields", () => {
      // Arrange: Row with minimal required fields and nulls for optionals
      const partialRow: DbProductRow = {
        id: "prod-minimal",
        title: "منتج تجريبي",
        price: 50,
        original_price: null,
        image: "https://example.com/single.jpg",
        images: null,
        vendor: null,
        vendor_id: null,
        vendor_rating: null,
        vendor_verified: null,
        category: "عام",
        category_slug: "general",
        rating: null,
        reviews: null,
        sales_count: null,
        badge: null,
        delivery: null,
        delivery_label: null,
        description: null,
        specs: null,
        features: null,
        stock_status: null,
        materials: null,
        colors: null,
        is_featured: null,
        is_flash_deal: null,
        created_at: new Date().toISOString(),
      };

      // Act
      const result = mapDbProductToProduct(partialRow);

      // Assert
      expect(result.originalPrice).toBeUndefined();
      expect(result.images).toEqual(["https://example.com/single.jpg"]);
      expect(result.vendor).toBe("سوق السعودية");
      expect(result.badge).toBe("منتج معتمد");
      expect(result.specs).toEqual([]);
      expect(result.features).toEqual([]);
      expect(result.stockStatus).toBe("in_stock");
    });
  });

  describe("mapDbCategoryToCategory", () => {
    it("should correctly map Category database row with subcategories", () => {
      // Arrange
      const rawCategory: DbCategoryRow = {
        id: "electronics",
        title: "الإلكترونيات",
        subtitle: "أحدث التقنيات",
        image: "https://example.com/cat.jpg",
        item_count: "١,٢٠٠ منتج",
        icon_name: "headphones",
        subcategories: [{ name: "سماعات", count: "٣٠٠", popular: true }],
        parent_id: null,
        slug: "electronics",
        department: "الأجهزة",
      };

      // Act
      const result = mapDbCategoryToCategory(rawCategory);

      // Assert
      expect(result.id).toBe("electronics");
      expect(result.title).toBe("الإلكترونيات");
      expect(result.subcategories).toHaveLength(1);
      expect(result.subcategories[0].popular).toBe(true);
    });

    it("should fallback gracefully when subtitle or subcategories are null", () => {
      // Arrange
      const emptyCat: DbCategoryRow = {
        id: "auto-parts",
        title: "قطع غيار السيارات",
        subtitle: null,
        image: null,
        item_count: null,
        icon_name: null,
        subcategories: null,
        parent_id: null,
        slug: "auto-parts",
        department: "المركبات",
      };

      // Act
      const result = mapDbCategoryToCategory(emptyCat);

      // Assert
      expect(result.subtitle).toBe("");
      expect(result.subcategories).toEqual([]);
      expect(result.image).toContain("unsplash.com");
    });
  });

  // =========================================================================
  // 2. QUERY & DATA FETCHING UNIT TESTS (WITH SUPABASE SPIES)
  // =========================================================================

  describe("fetchProductsFromSupabase", () => {
    it("should fetch products ordered by created_at descending", async () => {
      // Arrange
      const mockDbProducts: DbProductRow[] = [
        {
          id: "p1",
          title: "منتج 1",
          price: 100,
          original_price: null,
          image: "https://example.com/p1.jpg",
          images: [],
          vendor: "متجر النور",
          vendor_id: "v1",
          vendor_rating: 5,
          vendor_verified: true,
          category: "إلكترونيات",
          category_slug: "electronics",
          rating: 5,
          reviews: 10,
          sales_count: "٥٠+",
          badge: "جديد",
          delivery: "express",
          delivery_label: "سريع",
          description: "وصف",
          specs: [],
          features: [],
          stock_status: "in_stock",
          materials: [],
          colors: [],
          is_featured: false,
          is_flash_deal: false,
          created_at: new Date().toISOString(),
        },
      ];

      const mockOrder = vi.fn().mockResolvedValue({ data: mockDbProducts, error: null });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });
      vi.spyOn(supabase, "from").mockReturnValue({ select: mockSelect } as any);

      // Act
      const products = await fetchProductsFromSupabase();

      // Assert
      expect(supabase.from).toHaveBeenCalledWith("products");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockOrder).toHaveBeenCalledWith("created_at", { ascending: false });
      expect(products).toHaveLength(1);
      expect(products[0].id).toBe("p1");
    });

    it("should filter by category_slug when category parameter is supplied", async () => {
      // Arrange
      const mockEq = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockOrder = vi.fn().mockReturnValue({ eq: mockEq });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });
      vi.spyOn(supabase, "from").mockReturnValue({ select: mockSelect } as any);

      // Act
      await fetchProductsFromSupabase("mobiles");

      // Assert
      expect(mockEq).toHaveBeenCalledWith("category_slug", "mobiles");
    });

    it("should safely handle database network errors by returning empty array", async () => {
      // Arrange
      const mockOrder = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Database connection failed" },
      });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });
      vi.spyOn(supabase, "from").mockReturnValue({ select: mockSelect } as any);

      // Act
      const products = await fetchProductsFromSupabase();

      // Assert
      expect(products).toEqual([]);
    });
  });

  describe("fetchProductByIdFromSupabase", () => {
    it("should return single mapped product when record exists in database", async () => {
      // Arrange
      const mockDbRow: DbProductRow = {
        id: "target-prod",
        title: "ساعة ذكية",
        price: 999,
        original_price: 1200,
        image: "https://example.com/watch.jpg",
        images: ["https://example.com/watch.jpg"],
        vendor: "آي ستور",
        vendor_id: "istore",
        vendor_rating: 4.8,
        vendor_verified: true,
        category: "ساعات",
        category_slug: "watches",
        rating: 4.8,
        reviews: 45,
        sales_count: "١,٠٠٠+",
        badge: "أصلي",
        delivery: "express",
        delivery_label: "خلال ٢٤ ساعة",
        description: "ساعة ذكية رياضية",
        specs: [],
        features: [],
        stock_status: "in_stock",
        materials: [],
        colors: [],
        is_featured: true,
        is_flash_deal: false,
        created_at: new Date().toISOString(),
      };

      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: mockDbRow, error: null });
      const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      vi.spyOn(supabase, "from").mockReturnValue({ select: mockSelect } as any);

      // Act
      const product = await fetchProductByIdFromSupabase("target-prod");

      // Assert
      expect(mockEq).toHaveBeenCalledWith("id", "target-prod");
      expect(product).not.toBeNull();
      expect(product?.title).toBe("ساعة ذكية");
    });

    it("should return null when product is not found", async () => {
      // Arrange
      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      vi.spyOn(supabase, "from").mockReturnValue({ select: mockSelect } as any);

      // Act
      const product = await fetchProductByIdFromSupabase("missing-id");

      // Assert
      expect(product).toBeNull();
    });
  });

  describe("submitReviewToSupabase", () => {
    it("should insert review payload with verified=true and helpful_votes=1", async () => {
      // Arrange
      const mockInsert = vi.fn().mockResolvedValue({ data: [{ id: "rev-new" }], error: null });
      vi.spyOn(supabase, "from").mockReturnValue({ insert: mockInsert } as any);

      const reviewPayload = {
        product_id: "prod-101",
        author: "سلطان القحطاني",
        city: "أبها",
        item: "سماعات سوني",
        rating: 5,
        comment: "سماعة ممتازة وعزلها جبار",
      };

      // Act
      await submitReviewToSupabase(reviewPayload);

      // Assert
      expect(supabase.from).toHaveBeenCalledWith("reviews");
      expect(mockInsert).toHaveBeenCalledWith([
        expect.objectContaining({
          product_id: "prod-101",
          author: "سلطان القحطاني",
          rating: 5,
          verified: true,
          helpful_votes: 1,
        }),
      ]);
    });
  });
});
