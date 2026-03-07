-- Migration: Ecommerce RLS Policies
-- WO: WO-OVERHAUL-11 (backend pass)
-- All RLS policies for ecommerce tables

-- ============================================================
-- Helper: admin check function (reusable)
-- ============================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  );
$$;

-- ============================================================
-- products: public SELECT active; admin ALL
-- ============================================================
CREATE POLICY "products_public_read" ON products
  FOR SELECT USING (is_active = true);

CREATE POLICY "products_admin_all" ON products
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- product_categories: public SELECT active; admin ALL
-- ============================================================
CREATE POLICY "product_categories_public_read" ON product_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "product_categories_admin_all" ON product_categories
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- product_variants: public SELECT active; admin ALL
-- ============================================================
CREATE POLICY "product_variants_public_read" ON product_variants
  FOR SELECT USING (is_active = true);

CREATE POLICY "product_variants_admin_all" ON product_variants
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- orders: user own rows; admin ALL
-- ============================================================
CREATE POLICY "orders_user_select" ON orders
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "orders_user_insert" ON orders
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "orders_user_update" ON orders
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "orders_admin_all" ON orders
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- order_items: user own via order join; admin ALL
-- ============================================================
CREATE POLICY "order_items_user_select" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "order_items_admin_all" ON order_items
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- carts: user own (user_id or session_id); admin SELECT
-- ============================================================
CREATE POLICY "carts_user_select" ON carts
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "carts_user_insert" ON carts
  FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "carts_user_update" ON carts
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "carts_user_delete" ON carts
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "carts_admin_select" ON carts
  FOR SELECT USING (is_admin());

-- ============================================================
-- cart_items: user own via cart; admin SELECT
-- ============================================================
CREATE POLICY "cart_items_user_select" ON cart_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid())
  );

CREATE POLICY "cart_items_user_insert" ON cart_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid())
  );

CREATE POLICY "cart_items_user_update" ON cart_items
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid())
  );

CREATE POLICY "cart_items_user_delete" ON cart_items
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid())
  );

CREATE POLICY "cart_items_admin_select" ON cart_items
  FOR SELECT USING (is_admin());

-- ============================================================
-- discount_codes: admin ALL; service_role bypasses RLS
-- ============================================================
CREATE POLICY "discount_codes_admin_all" ON discount_codes
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- Note: service_role bypasses RLS by default for validation edge function

-- ============================================================
-- shipping_methods: public SELECT active; admin ALL
-- ============================================================
CREATE POLICY "shipping_methods_public_read" ON shipping_methods
  FOR SELECT USING (is_active = true);

CREATE POLICY "shipping_methods_admin_all" ON shipping_methods
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- reviews: public SELECT approved; user INSERT own; admin ALL
-- ============================================================
CREATE POLICY "reviews_public_read" ON reviews
  FOR SELECT USING (is_approved = true);

CREATE POLICY "reviews_user_insert" ON reviews
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "reviews_admin_all" ON reviews
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- wishlists: user CRUD own; public SELECT public wishlists
-- ============================================================
CREATE POLICY "wishlists_user_crud" ON wishlists
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "wishlists_public_read" ON wishlists
  FOR SELECT USING (is_public = true);

-- ============================================================
-- wishlist_items: user CRUD own via wishlist
-- ============================================================
CREATE POLICY "wishlist_items_user_crud" ON wishlist_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM wishlists WHERE wishlists.id = wishlist_items.wishlist_id AND wishlists.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM wishlists WHERE wishlists.id = wishlist_items.wishlist_id AND wishlists.user_id = auth.uid())
  );
