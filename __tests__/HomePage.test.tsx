// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HomePage from '@/app/page';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ href, children }: any) => <a href={href}>{children}</a>,
}));

// Mock framer-motion's motion.div to a simple div
vi.mock('framer-motion', () => ({
  motion: { div: (props: any) => <div {...props} /> },
}));

const mockAddToCart = vi.fn();
const mockToggleWishlist = vi.fn();

// Mock cart context
vi.mock('@/context/CartContext', () => ({
  useCart: () => ({
    addToCart: mockAddToCart,
    toggleWishlist: mockToggleWishlist,
    isWishlisted: () => false,
    wishlist: [],
    cartCount: 0,
    total: 0,
    setIsCartDrawerOpen: vi.fn(),
    cart: [],
  }),
}));

// Mock supabase data functions
vi.mock('@/lib/supabase', () => ({
  fetchProductsFromSupabase: vi.fn(),
  fetchTopCategoriesFromSupabase: vi.fn(),
  fetchReviewsFromSupabase: vi.fn(),
  submitReviewToSupabase: vi.fn(),
}));

import {
  fetchProductsFromSupabase,
  fetchTopCategoriesFromSupabase,
  fetchReviewsFromSupabase,
  submitReviewToSupabase,
} from '@/lib/supabase';

const mockProduct = {
  id: 'sony-wh1000xm5',
  title: 'سماعات رأس لاسلكية سوني WH-1000XM5',
  image: '/mock-image.jpg',
  price: 1500,
  originalPrice: 1800,
  badge: 'Flash',
  salesCount: 123,
  vendor: 'Sony',
  rating: 5,
  reviews: 10,
  categorySlug: 'electronics',
  category: 'electronics',
  item: 'سماعات',
};

const mockCategory = {
  id: 'electronics',
  title: 'الإلكترونيات',
  image: '/cat-image.jpg',
  itemCount: '200+',
};

const mockReview = {
  id: 'rev-1',
  name: 'أحمد',
  title: 'مشتري موثق عبر نفاذ الوطني',
  city: 'الرياض',
  item: 'سماعات',
  rating: 5,
  date: 'الآن',
  comment: 'منتج رائع',
  helpfulCount: 2,
};

describe('HomePage component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
    (fetchProductsFromSupabase as any).mockResolvedValue([mockProduct]);
    (fetchTopCategoriesFromSupabase as any).mockResolvedValue([mockCategory]);
    (fetchReviewsFromSupabase as any).mockResolvedValue([mockReview]);
  });

  it('renders products after loading data from Supabase', async () => {
    render(<HomePage />);

    // Wait for async data load
    await waitFor(() => {
      const elements = screen.getAllByText(mockProduct.title);
      expect(elements.length).toBeGreaterThan(0);
    });

    // Verify product price formatting appears (SAR suffix in Arabic)
    expect(screen.getAllByText(/ر\.س/).length).toBeGreaterThan(0);
  });

  it('adds product to cart when Add to Cart button is clicked', async () => {
    render(<HomePage />);
    await waitFor(() => {
      expect(screen.getAllByText(mockProduct.title).length).toBeGreaterThan(0);
    });

    const addButtons = screen.getAllByRole('button', { name: /أضف للسلة|إضافة للسلة/i });
    expect(addButtons.length).toBeGreaterThan(0);
    fireEvent.click(addButtons[0]);

    expect(mockAddToCart).toHaveBeenCalled();
  });

  it('filters products by category pills', async () => {
    render(<HomePage />);
    await waitFor(() => {
      expect(screen.getAllByText(mockProduct.title).length).toBeGreaterThan(0);
    });

    // Click on a different category pill (e.g., "الهواتف وملحقاتها")
    const otherPill = screen.getByRole('button', { name: /الهواتف وملحقاتها/i });
    fireEvent.click(otherPill);

    // Product cards in the main grid should be filtered out
    await waitFor(() => {
      // The product title in the filtered grid shouldn't match filtered items
      const elements = screen.queryAllByText(mockProduct.title);
      // Flash deal might still display product 0, but the main grid cards are filtered
      expect(elements.length).toBeLessThanOrEqual(1);
    });
  });
});
