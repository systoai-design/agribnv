-- UMANI Full Ecosystem Schema Migration (v3.0)
-- Aligns live Supabase database with SRS.md and PRD-001 through PRD-007
-- Pillars: Farm Profile, Stays, Experiences, Events, Products, Kitchen, Reels, Payments, Dual Reviews

-- 1. Extend App Roles
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'moderator';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'admin';

-- 2. Pillar 1: Unified Farm Profiles Ecosystem
CREATE TABLE IF NOT EXISTS public.farm_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  farm_name TEXT NOT NULL,
  tagline TEXT,
  story TEXT,
  terroir_notes TEXT,
  location TEXT NOT NULL,
  address TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  cover_image_url TEXT,
  avatar_url TEXT,
  crops TEXT[] DEFAULT '{}',
  livestock TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  facilities TEXT[] DEFAULT '{}',
  is_verified BOOLEAN NOT NULL DEFAULT false,
  operating_hours JSONB DEFAULT '{}'::jsonb,
  social_links JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_farm_profiles_host UNIQUE (host_id)
);

ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS farm_id UUID REFERENCES public.farm_profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_farm_profiles_host_id ON public.farm_profiles(host_id);
CREATE INDEX IF NOT EXISTS idx_farm_profiles_location ON public.farm_profiles(location);
CREATE INDEX IF NOT EXISTS idx_properties_farm_id ON public.properties(farm_id);

ALTER TABLE public.farm_profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'farm_profiles' AND policyname = 'Anyone can view farm profiles') THEN
    CREATE POLICY "Anyone can view farm profiles" ON public.farm_profiles FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'farm_profiles' AND policyname = 'Hosts can insert their own farm profile') THEN
    CREATE POLICY "Hosts can insert their own farm profile" ON public.farm_profiles FOR INSERT WITH CHECK ((SELECT auth.uid()) = host_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'farm_profiles' AND policyname = 'Hosts can update their own farm profile') THEN
    CREATE POLICY "Hosts can update their own farm profile" ON public.farm_profiles FOR UPDATE USING ((SELECT auth.uid()) = host_id);
  END IF;
END $$;

-- 3. Discovery Layer: Social Feed, Reels, Likes & Follows
CREATE TABLE IF NOT EXISTS public.farm_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES public.farm_profiles(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  tagged_property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.farm_reels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES public.farm_profiles(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT,
  caption TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds NUMERIC DEFAULT 0,
  aspect_ratio TEXT DEFAULT '9:16',
  tagged_property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  views_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.farm_posts(id) ON DELETE CASCADE,
  reel_id UUID REFERENCES public.farm_reels(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_like_target CHECK (
    (post_id IS NOT NULL AND reel_id IS NULL) OR 
    (post_id IS NULL AND reel_id IS NOT NULL)
  ),
  CONSTRAINT uq_user_post_like UNIQUE (user_id, post_id),
  CONSTRAINT uq_user_reel_like UNIQUE (user_id, reel_id)
);

CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.farm_posts(id) ON DELETE CASCADE,
  reel_id UUID REFERENCES public.farm_reels(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(trim(content)) > 0 AND char_length(content) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_comment_target CHECK (
    (post_id IS NOT NULL AND reel_id IS NULL) OR 
    (post_id IS NULL AND reel_id IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS public.farm_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  farm_id UUID NOT NULL REFERENCES public.farm_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_follower_farm UNIQUE (follower_id, farm_id)
);

CREATE INDEX IF NOT EXISTS idx_farm_posts_farm_id ON public.farm_posts(farm_id);
CREATE INDEX IF NOT EXISTS idx_farm_posts_author_id ON public.farm_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_farm_reels_farm_id ON public.farm_reels(farm_id);
CREATE INDEX IF NOT EXISTS idx_farm_reels_author_id ON public.farm_reels(author_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_reel_id ON public.post_likes(reel_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON public.post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_reel_id ON public.post_comments(reel_id);
CREATE INDEX IF NOT EXISTS idx_farm_follows_follower_id ON public.farm_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_farm_follows_farm_id ON public.farm_follows(farm_id);

ALTER TABLE public.farm_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_follows ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'farm_posts' AND policyname = 'Anyone can view farm posts') THEN
    CREATE POLICY "Anyone can view farm posts" ON public.farm_posts FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'farm_posts' AND policyname = 'Hosts can create their own farm posts') THEN
    CREATE POLICY "Hosts can create their own farm posts" ON public.farm_posts FOR INSERT WITH CHECK ((SELECT auth.uid()) = author_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'farm_posts' AND policyname = 'Hosts can update their own farm posts') THEN
    CREATE POLICY "Hosts can update their own farm posts" ON public.farm_posts FOR UPDATE USING ((SELECT auth.uid()) = author_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'farm_posts' AND policyname = 'Hosts can delete their own farm posts') THEN
    CREATE POLICY "Hosts can delete their own farm posts" ON public.farm_posts FOR DELETE USING ((SELECT auth.uid()) = author_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'farm_reels' AND policyname = 'Anyone can view farm reels') THEN
    CREATE POLICY "Anyone can view farm reels" ON public.farm_reels FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'farm_reels' AND policyname = 'Hosts can create their own farm reels') THEN
    CREATE POLICY "Hosts can create their own farm reels" ON public.farm_reels FOR INSERT WITH CHECK ((SELECT auth.uid()) = author_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'farm_reels' AND policyname = 'Hosts can update their own farm reels') THEN
    CREATE POLICY "Hosts can update their own farm reels" ON public.farm_reels FOR UPDATE USING ((SELECT auth.uid()) = author_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'farm_reels' AND policyname = 'Hosts can delete their own farm reels') THEN
    CREATE POLICY "Hosts can delete their own farm reels" ON public.farm_reels FOR DELETE USING ((SELECT auth.uid()) = author_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'post_likes' AND policyname = 'Anyone can view likes') THEN
    CREATE POLICY "Anyone can view likes" ON public.post_likes FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'post_likes' AND policyname = 'Users can manage their own likes') THEN
    CREATE POLICY "Users can manage their own likes" ON public.post_likes FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'post_comments' AND policyname = 'Anyone can view comments') THEN
    CREATE POLICY "Anyone can view comments" ON public.post_comments FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'post_comments' AND policyname = 'Users can insert comments') THEN
    CREATE POLICY "Users can insert comments" ON public.post_comments FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'post_comments' AND policyname = 'Users can delete their own comments') THEN
    CREATE POLICY "Users can delete their own comments" ON public.post_comments FOR DELETE USING ((SELECT auth.uid()) = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'farm_follows' AND policyname = 'Anyone can view follows') THEN
    CREATE POLICY "Anyone can view follows" ON public.farm_follows FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'farm_follows' AND policyname = 'Users can manage their own follows') THEN
    CREATE POLICY "Users can manage their own follows" ON public.farm_follows FOR ALL USING ((SELECT auth.uid()) = follower_id) WITH CHECK ((SELECT auth.uid()) = follower_id);
  END IF;
END $$;

-- 4. Pillar 4: Seasonal Events & Workshops
CREATE TABLE IF NOT EXISTS public.farm_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES public.farm_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'workshop',
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  ticket_price NUMERIC NOT NULL DEFAULT 0 CHECK (ticket_price >= 0),
  max_capacity INTEGER NOT NULL CHECK (max_capacity > 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.farm_events(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tickets_count INTEGER NOT NULL DEFAULT 1 CHECK (tickets_count > 0),
  total_price NUMERIC NOT NULL DEFAULT 0 CHECK (total_price >= 0),
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_farm_events_farm_id ON public.farm_events(farm_id);
CREATE INDEX IF NOT EXISTS idx_farm_events_event_date ON public.farm_events(event_date);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_event_id ON public.event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_guest_id ON public.event_rsvps(guest_id);

ALTER TABLE public.farm_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'farm_events' AND policyname = 'Anyone can view active farm events') THEN
    CREATE POLICY "Anyone can view active farm events" ON public.farm_events FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'farm_events' AND policyname = 'Hosts can manage farm events') THEN
    CREATE POLICY "Hosts can manage farm events" ON public.farm_events FOR ALL
      USING (EXISTS (SELECT 1 FROM public.farm_profiles fp WHERE fp.id = farm_events.farm_id AND fp.host_id = (SELECT auth.uid())))
      WITH CHECK (EXISTS (SELECT 1 FROM public.farm_profiles fp WHERE fp.id = farm_events.farm_id AND fp.host_id = (SELECT auth.uid())));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'event_rsvps' AND policyname = 'Users can view their own event RSVPs') THEN
    CREATE POLICY "Users can view their own event RSVPs" ON public.event_rsvps FOR SELECT
      USING ((SELECT auth.uid()) = guest_id OR EXISTS (
        SELECT 1 FROM public.farm_events fe JOIN public.farm_profiles fp ON fe.farm_id = fp.id WHERE fe.id = event_rsvps.event_id AND fp.host_id = (SELECT auth.uid())
      ));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'event_rsvps' AND policyname = 'Guests can book event tickets') THEN
    CREATE POLICY "Guests can book event tickets" ON public.event_rsvps FOR INSERT
      WITH CHECK ((SELECT auth.uid()) = guest_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'event_rsvps' AND policyname = 'Guests can cancel their own RSVPs') THEN
    CREATE POLICY "Guests can cancel their own RSVPs" ON public.event_rsvps FOR UPDATE
      USING ((SELECT auth.uid()) = guest_id);
  END IF;
END $$;

-- 5. Pillars 5 & 6: Farm Products & Farm Kitchen
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES public.farm_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL CHECK (price >= 0),
  category TEXT NOT NULL DEFAULT 'fresh_harvest',
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  unit TEXT NOT NULL DEFAULT 'kg',
  is_available BOOLEAN NOT NULL DEFAULT true,
  images TEXT[] DEFAULT '{}',
  perishable_claim_hours INTEGER NOT NULL DEFAULT 24,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.kitchen_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES public.farm_profiles(id) ON DELETE CASCADE,
  dish_name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL CHECK (price >= 0),
  ingredients TEXT[] DEFAULT '{}',
  dietary_tags TEXT[] DEFAULT '{}',
  advance_notice_hours INTEGER NOT NULL DEFAULT 2,
  is_available BOOLEAN NOT NULL DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES public.farm_profiles(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_type TEXT NOT NULL CHECK (order_type IN ('product', 'kitchen', 'mixed')),
  total_amount NUMERIC NOT NULL CHECK (total_amount >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'ready', 'completed', 'cancelled')),
  fulfillment_type TEXT NOT NULL DEFAULT 'pickup' CHECK (fulfillment_type IN ('pickup', 'farm_delivery', 'courier')),
  special_instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  menu_id UUID REFERENCES public.kitchen_menus(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC NOT NULL CHECK (unit_price >= 0)
);

CREATE INDEX IF NOT EXISTS idx_products_farm_id ON public.products(farm_id);
CREATE INDEX IF NOT EXISTS idx_kitchen_menus_farm_id ON public.kitchen_menus(farm_id);
CREATE INDEX IF NOT EXISTS idx_orders_farm_id ON public.orders(farm_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kitchen_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'Anyone can view available products') THEN
    CREATE POLICY "Anyone can view available products" ON public.products FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'Hosts can manage products') THEN
    CREATE POLICY "Hosts can manage products" ON public.products FOR ALL
      USING (EXISTS (SELECT 1 FROM public.farm_profiles fp WHERE fp.id = products.farm_id AND fp.host_id = (SELECT auth.uid())))
      WITH CHECK (EXISTS (SELECT 1 FROM public.farm_profiles fp WHERE fp.id = products.farm_id AND fp.host_id = (SELECT auth.uid())));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'kitchen_menus' AND policyname = 'Anyone can view kitchen menus') THEN
    CREATE POLICY "Anyone can view kitchen menus" ON public.kitchen_menus FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'kitchen_menus' AND policyname = 'Hosts can manage kitchen menus') THEN
    CREATE POLICY "Hosts can manage kitchen menus" ON public.kitchen_menus FOR ALL
      USING (EXISTS (SELECT 1 FROM public.farm_profiles fp WHERE fp.id = kitchen_menus.farm_id AND fp.host_id = (SELECT auth.uid())))
      WITH CHECK (EXISTS (SELECT 1 FROM public.farm_profiles fp WHERE fp.id = kitchen_menus.farm_id AND fp.host_id = (SELECT auth.uid())));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'Customers and Hosts can view orders') THEN
    CREATE POLICY "Customers and Hosts can view orders" ON public.orders FOR SELECT
      USING ((SELECT auth.uid()) = customer_id OR EXISTS (
        SELECT 1 FROM public.farm_profiles fp WHERE fp.id = orders.farm_id AND fp.host_id = (SELECT auth.uid())
      ));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'Customers can create orders') THEN
    CREATE POLICY "Customers can create orders" ON public.orders FOR INSERT
      WITH CHECK ((SELECT auth.uid()) = customer_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'Hosts can update orders') THEN
    CREATE POLICY "Hosts can update orders" ON public.orders FOR UPDATE
      USING (EXISTS (SELECT 1 FROM public.farm_profiles fp WHERE fp.id = orders.farm_id AND fp.host_id = (SELECT auth.uid())));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'order_items' AND policyname = 'Order items are viewable with order') THEN
    CREATE POLICY "Order items are viewable with order" ON public.order_items FOR SELECT
      USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND (o.customer_id = (SELECT auth.uid()) OR EXISTS (
        SELECT 1 FROM public.farm_profiles fp WHERE fp.id = o.farm_id AND fp.host_id = (SELECT auth.uid())
      ))));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'order_items' AND policyname = 'Customers can insert order items') THEN
    CREATE POLICY "Customers can insert order items" ON public.order_items FOR INSERT
      WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.customer_id = (SELECT auth.uid())));
  END IF;
END $$;

-- 6. Module 11: Whole-Farm & Farmer Dual Reviews Engine
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS farmer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS farm_rating INTEGER CHECK (farm_rating BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS farm_comment TEXT,
ADD COLUMN IF NOT EXISTS farmer_rating INTEGER CHECK (farmer_rating BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS farmer_comment TEXT,
ADD COLUMN IF NOT EXISTS sub_scores JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS photo_urls TEXT[] DEFAULT ARRAY[]::TEXT[];

CREATE TABLE IF NOT EXISTS public.review_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL UNIQUE REFERENCES public.reviews(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(trim(content)) > 0 AND char_length(content) <= 800),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_farmer_id ON public.reviews(farmer_id);
CREATE INDEX IF NOT EXISTS idx_review_responses_review_id ON public.review_responses(review_id);
CREATE INDEX IF NOT EXISTS idx_review_responses_host_id ON public.review_responses(host_id);

ALTER TABLE public.review_responses ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'review_responses' AND policyname = 'Anyone can view host review responses') THEN
    CREATE POLICY "Anyone can view host review responses" ON public.review_responses FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'review_responses' AND policyname = 'Hosts can manage their own review responses') THEN
    CREATE POLICY "Hosts can manage their own review responses" ON public.review_responses FOR ALL
      USING ((SELECT auth.uid()) = host_id)
      WITH CHECK ((SELECT auth.uid()) = host_id);
  END IF;
END $$;

CREATE OR REPLACE VIEW public.farm_ratings AS
SELECT
  property_id,
  ROUND(AVG(COALESCE(farm_rating, rating))::numeric, 1) AS average_farm_rating,
  COUNT(id) AS farm_review_count
FROM public.reviews
GROUP BY property_id;

CREATE OR REPLACE VIEW public.farmer_hospitality_ratings AS
SELECT
  farmer_id,
  ROUND(AVG(COALESCE(farmer_rating, rating))::numeric, 1) AS average_hospitality_rating,
  COUNT(id) AS hospitality_review_count
FROM public.reviews
WHERE farmer_id IS NOT NULL
GROUP BY farmer_id;

-- 7. Module 10: Payments, Escrow Ledger & Disbursements
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'PHP',
  payment_method TEXT NOT NULL CHECK (payment_method IN ('gcash', 'card', 'maya', 'bank_transfer')),
  payment_intent_id TEXT UNIQUE,
  idempotency_key UUID UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'refunded')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.escrow_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_amount NUMERIC NOT NULL CHECK (total_amount >= 0),
  commission_rate NUMERIC NOT NULL DEFAULT 0.15,
  platform_fee NUMERIC NOT NULL DEFAULT 0,
  host_payout_amount NUMERIC NOT NULL CHECK (host_payout_amount >= 0),
  status TEXT NOT NULL DEFAULT 'holding' CHECK (status IN ('holding', 'released', 'refunded', 'disputed')),
  release_due_at TIMESTAMPTZ NOT NULL,
  released_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'PHP',
  payout_method TEXT NOT NULL DEFAULT 'bank_transfer',
  payout_reference TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'reel', 'comment', 'review', 'profile', 'property')),
  content_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
  moderator_notes TEXT,
  resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.rate_limits (
  key TEXT PRIMARY KEY,
  tokens NUMERIC NOT NULL,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX IF NOT EXISTS idx_rate_limits_last_updated ON public.rate_limits(last_updated);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_escrow_ledger_host_id ON public.escrow_ledger(host_id);
CREATE INDEX IF NOT EXISTS idx_payouts_host_id ON public.payouts(host_id);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_status ON public.moderation_queue(status);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_queue ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'payments' AND policyname = 'Users can view their own payments') THEN
    CREATE POLICY "Users can view their own payments" ON public.payments FOR SELECT
      USING ((SELECT auth.uid()) = user_id OR EXISTS (
        SELECT 1 FROM public.bookings b JOIN public.properties p ON b.property_id = p.id
        WHERE b.id = payments.booking_id AND p.host_id = (SELECT auth.uid())
      ));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'escrow_ledger' AND policyname = 'Hosts can view their own escrow records') THEN
    CREATE POLICY "Hosts can view their own escrow records" ON public.escrow_ledger FOR SELECT
      USING ((SELECT auth.uid()) = host_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'payouts' AND policyname = 'Hosts can view their own payouts') THEN
    CREATE POLICY "Hosts can view their own payouts" ON public.payouts FOR SELECT
      USING ((SELECT auth.uid()) = host_id);
  END IF;
END $$;
