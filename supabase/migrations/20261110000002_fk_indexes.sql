create index if not exists idx_cart_items_product on public.cart_items(product_id);
create index if not exists idx_wishlists_product on public.wishlists(product_id);
