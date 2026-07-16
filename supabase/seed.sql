-- =====================================================================
-- Agribnv — Sample listings for visual demo
-- Run this ONCE after setup.sql and after you have at least one host user.
-- Uses the first host in user_roles as the owner. Re-running is safe
-- (DELETE block at top clears previous seeded listings by name prefix).
-- =====================================================================

-- Clear previously-seeded properties so this script is re-runnable
DELETE FROM public.properties WHERE name LIKE '[SEED] %';

DO $$
DECLARE
  seed_host_id UUID;
  prop_id UUID;
BEGIN
  -- Grab the first host account we find
  SELECT user_id INTO seed_host_id
  FROM public.user_roles
  WHERE role = 'host'
  ORDER BY created_at ASC
  LIMIT 1;

  IF seed_host_id IS NULL THEN
    RAISE EXCEPTION 'No host user found. Sign up at least one host account in the app before running this seed.';
  END IF;

  ---------------------------------------------------------------------
  -- 1. Mango Heritage Farm — Guimaras (farm_stay / agrifarm)
  ---------------------------------------------------------------------
  INSERT INTO public.properties (
    host_id, name, description, location, address,
    latitude, longitude, price_per_night,
    max_guests, bedrooms, bathrooms,
    category, listing_type, subcategory,
    amenities, is_published
  ) VALUES (
    seed_host_id,
    '[SEED] Mango Heritage Farm',
    'Stay among century-old mango trees on a working heritage farm in Guimaras. Wake up to fresh fruit breakfasts and wander orchard trails with the host family.',
    'Jordan, Guimaras',
    'Brgy. Rizal, Jordan',
    10.6591, 122.5962,
    2500, 6, 2, 1,
    'farmstay', 'farm_stay', 'agrifarm',
    ARRAY['WiFi', 'Free Parking', 'Farm Tour', 'Breakfast Included', 'Farm Animals', 'Garden View'],
    true
  ) RETURNING id INTO prop_id;

  INSERT INTO public.property_images (property_id, image_url, is_primary, display_order, category, caption) VALUES
    (prop_id, 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80', true, 0, 'exterior', 'Golden hour over the mango orchard'),
    (prop_id, 'https://images.unsplash.com/photo-1464278533981-50106e6176b1?w=1200&q=80', false, 1, 'outdoor', 'Orchard trail'),
    (prop_id, 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1200&q=80', false, 2, 'outdoor', 'Morning mist on the farm');

  ---------------------------------------------------------------------
  -- 2. Pinto Highland Cottage — Tagaytay (farm_stay / farm_cottage)
  ---------------------------------------------------------------------
  INSERT INTO public.properties (
    host_id, name, description, location, address,
    latitude, longitude, price_per_night,
    max_guests, bedrooms, bathrooms,
    category, listing_type, subcategory,
    amenities, is_published
  ) VALUES (
    seed_host_id,
    '[SEED] Pinto Highland Cottage',
    'A cozy 2-bedroom cottage overlooking rolling Tagaytay ridges. Cool highland air, organic vegetable garden, and a bonfire pit for chilly evenings.',
    'Tagaytay, Cavite',
    'Calabuso, Tagaytay',
    14.1153, 120.9621,
    3800, 4, 2, 2,
    'farmstay', 'farm_stay', 'farm_cottage',
    ARRAY['WiFi', 'Kitchen', 'Free Parking', 'Garden View', 'Bonfire Area', 'BBQ Grill'],
    true
  ) RETURNING id INTO prop_id;

  INSERT INTO public.property_images (property_id, image_url, is_primary, display_order, category, caption) VALUES
    (prop_id, 'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=1200&q=80', true, 0, 'exterior', 'Cottage at dusk'),
    (prop_id, 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200&q=80', false, 1, 'outdoor', 'Ridge views'),
    (prop_id, 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200&q=80', false, 2, 'living_area', 'Warm interior');

  ---------------------------------------------------------------------
  -- 3. Bamboo Nipa Hut — Nueva Valencia (farm_stay / kubo_hut)
  ---------------------------------------------------------------------
  INSERT INTO public.properties (
    host_id, name, description, location, address,
    latitude, longitude, price_per_night,
    max_guests, bedrooms, bathrooms,
    category, listing_type, subcategory,
    amenities, is_published
  ) VALUES (
    seed_host_id,
    '[SEED] Bamboo Nipa Hut by the Shore',
    'Authentic nipa hut a few steps from a quiet cove. Hand-built bamboo furniture, outdoor shower, and hammocks under the stars.',
    'Nueva Valencia, Guimaras',
    'Lucmayan, Nueva Valencia',
    10.5128, 122.5758,
    1800, 2, 1, 1,
    'farmstay', 'farm_stay', 'kubo_hut',
    ARRAY['Beach Access', 'Outdoor Dining', 'Free Parking', 'Fishing'],
    true
  ) RETURNING id INTO prop_id;

  INSERT INTO public.property_images (property_id, image_url, is_primary, display_order, category, caption) VALUES
    (prop_id, 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&q=80', true, 0, 'exterior', 'Hut at golden hour'),
    (prop_id, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80', false, 1, 'outdoor', 'Cove a short walk away');

  ---------------------------------------------------------------------
  -- 4. Baguio Strawberry Homestay — (farm_stay / homestay)
  ---------------------------------------------------------------------
  INSERT INTO public.properties (
    host_id, name, description, location, address,
    latitude, longitude, price_per_night,
    max_guests, bedrooms, bathrooms,
    category, listing_type, subcategory,
    amenities, is_published
  ) VALUES (
    seed_host_id,
    '[SEED] Baguio Strawberry Homestay',
    'Family-run homestay with a working strawberry patch. Pick your own berries for breakfast and hike pine-scented trails right from the front porch.',
    'Baguio, Benguet',
    'Km. 6 La Trinidad, Baguio',
    16.4023, 120.5960,
    4200, 8, 3, 2,
    'farmstay', 'farm_stay', 'homestay',
    ARRAY['WiFi', 'Kitchen', 'Free Parking', 'Breakfast Included', 'Hiking Trails', 'Farm Tour'],
    true
  ) RETURNING id INTO prop_id;

  INSERT INTO public.property_images (property_id, image_url, is_primary, display_order, category, caption) VALUES
    (prop_id, 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80', true, 0, 'exterior', 'Home and garden'),
    (prop_id, 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=1200&q=80', false, 1, 'outdoor', 'Strawberry rows'),
    (prop_id, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80', false, 2, 'living_area', 'Breakfast nook');

  ---------------------------------------------------------------------
  -- 5. Lakbay Dairy Farm Experience — Batangas (farm_experience / agrifarm)
  ---------------------------------------------------------------------
  INSERT INTO public.properties (
    host_id, name, description, location, address,
    latitude, longitude, price_per_night,
    max_guests, bedrooms, bathrooms,
    category, listing_type, subcategory,
    amenities, is_published
  ) VALUES (
    seed_host_id,
    '[SEED] Lakbay Dairy Farm Experience',
    'Half-day hands-on experience on a working dairy farm. Milk a cow, churn butter, sample fresh carabao cheese, and pack a picnic of farm-made treats.',
    'Lipa, Batangas',
    'Barangay San Salvador, Lipa',
    13.9414, 121.1624,
    2100, 10, 2, 2,
    'farmstay', 'farm_experience', 'agrifarm',
    ARRAY['Farm Tour', 'Farm Animals', 'Free Parking', 'Outdoor Dining'],
    true
  ) RETURNING id INTO prop_id;

  INSERT INTO public.property_images (property_id, image_url, is_primary, display_order, category, caption) VALUES
    (prop_id, 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1200&q=80', true, 0, 'farm_animals', 'Dairy herd at dawn'),
    (prop_id, 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=1200&q=80', false, 1, 'outdoor', 'Rolling pastures');

  ---------------------------------------------------------------------
  -- 6. Carabao Countryside Tour — Laguna (farm_tour / agrifarm)
  ---------------------------------------------------------------------
  INSERT INTO public.properties (
    host_id, name, description, location, address,
    latitude, longitude, price_per_night,
    max_guests, bedrooms, bathrooms,
    category, listing_type, subcategory,
    amenities, is_published
  ) VALUES (
    seed_host_id,
    '[SEED] Carabao Countryside Tour',
    'Guided half-day tour of Calauan rice terraces by carabao cart. Includes traditional merienda, coconut husking demo, and a visit to a heritage kubo.',
    'Calauan, Laguna',
    'Barangay Prinza, Calauan',
    14.1486, 121.3155,
    1900, 12, 1, 1,
    'farmstay', 'farm_tour', 'agrifarm',
    ARRAY['Farm Tour', 'Farm Animals', 'Outdoor Dining', 'Free Parking'],
    true
  ) RETURNING id INTO prop_id;

  INSERT INTO public.property_images (property_id, image_url, is_primary, display_order, category, caption) VALUES
    (prop_id, 'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=1200&q=80', true, 0, 'outdoor', 'Rice terraces'),
    (prop_id, 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&q=80', false, 1, 'farm_animals', 'Our carabao');

  ---------------------------------------------------------------------
  -- 7. Cebu Highland Orchard — Cebu (farm_stay / agrifarm)
  ---------------------------------------------------------------------
  INSERT INTO public.properties (
    host_id, name, description, location, address,
    latitude, longitude, price_per_night,
    max_guests, bedrooms, bathrooms,
    category, listing_type, subcategory,
    amenities, is_published
  ) VALUES (
    seed_host_id,
    '[SEED] Cebu Highland Orchard',
    'A tranquil fruit orchard in the mountains of Cebu. Enjoy cool breezes, fresh fruit picking, and panoramic views of the island.',
    'Balamban, Cebu',
    'Transcentral Highway, Balamban',
    10.4965, 123.7744,
    3200, 6, 2, 1,
    'farmstay', 'farm_stay', 'agrifarm',
    ARRAY['WiFi', 'Free Parking', 'Farm Tour', 'Breakfast Included', 'Mountain View'],
    true
  ) RETURNING id INTO prop_id;

  INSERT INTO public.property_images (property_id, image_url, is_primary, display_order, category, caption) VALUES
    (prop_id, 'https://images.unsplash.com/photo-1590682680695-43b964a3ae17?w=1200&q=80', true, 0, 'exterior', 'Highland orchard view'),
    (prop_id, 'https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?w=1200&q=80', false, 1, 'outdoor', 'Farm fields');

  ---------------------------------------------------------------------
  -- 8. El Nido Coastal Farm — Palawan (farm_stay / kubo_hut)
  ---------------------------------------------------------------------
  INSERT INTO public.properties (
    host_id, name, description, location, address,
    latitude, longitude, price_per_night,
    max_guests, bedrooms, bathrooms,
    category, listing_type, subcategory,
    amenities, is_published
  ) VALUES (
    seed_host_id,
    '[SEED] El Nido Coastal Farm',
    'A secluded eco-farm steps away from a pristine beach. Sleep in a traditional bamboo hut and wake up to the sound of waves.',
    'El Nido, Palawan',
    'Teneguiban, El Nido',
    11.3551, 119.5391,
    2800, 2, 1, 1,
    'farmstay', 'farm_stay', 'kubo_hut',
    ARRAY['Beach Access', 'Outdoor Dining', 'Free Parking', 'Snorkeling'],
    true
  ) RETURNING id INTO prop_id;

  INSERT INTO public.property_images (property_id, image_url, is_primary, display_order, category, caption) VALUES
    (prop_id, 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200&q=80', true, 0, 'exterior', 'Coastal farm hut'),
    (prop_id, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80', false, 1, 'outdoor', 'Nearby beach');

  ---------------------------------------------------------------------
  -- 9. Davao Cacao Estate — Davao (farm_stay / agrifarm)
  ---------------------------------------------------------------------
  INSERT INTO public.properties (
    host_id, name, description, location, address,
    latitude, longitude, price_per_night,
    max_guests, bedrooms, bathrooms,
    category, listing_type, subcategory,
    amenities, is_published
  ) VALUES (
    seed_host_id,
    '[SEED] Davao Cacao Estate',
    'Stay at a working cacao plantation. Learn the chocolate-making process from bean to bar and enjoy endless cups of rich local tsokolate.',
    'Davao City, Davao del Sur',
    'Malagos, Davao City',
    7.1895, 125.4093,
    3500, 4, 2, 2,
    'farmstay', 'farm_stay', 'agrifarm',
    ARRAY['WiFi', 'Kitchen', 'Free Parking', 'Farm Tour', 'Breakfast Included'],
    true
  ) RETURNING id INTO prop_id;

  INSERT INTO public.property_images (property_id, image_url, is_primary, display_order, category, caption) VALUES
    (prop_id, 'https://images.unsplash.com/photo-1587826315250-71101889a9f2?w=1200&q=80', true, 0, 'exterior', 'Cacao estate'),
    (prop_id, 'https://images.unsplash.com/photo-1621317666249-16629739fcce?w=1200&q=80', false, 1, 'outdoor', 'Cacao pods');

  ---------------------------------------------------------------------
  -- 10. Bohol Honey Bee Farm — Bohol (farm_stay / farm_cottage)
  ---------------------------------------------------------------------
  INSERT INTO public.properties (
    host_id, name, description, location, address,
    latitude, longitude, price_per_night,
    max_guests, bedrooms, bathrooms,
    category, listing_type, subcategory,
    amenities, is_published
  ) VALUES (
    seed_host_id,
    '[SEED] Bohol Honey Bee Farm',
    'Cozy cliffside cottage surrounded by organic gardens and bee colonies. Includes a free honey tasting and a farm-to-table organic breakfast.',
    'Panglao, Bohol',
    'Dao, Panglao',
    9.6190, 123.8016,
    4500, 4, 1, 1,
    'farmstay', 'farm_stay', 'farm_cottage',
    ARRAY['WiFi', 'Ocean View', 'Free Parking', 'Breakfast Included', 'Farm Tour'],
    true
  ) RETURNING id INTO prop_id;

  INSERT INTO public.property_images (property_id, image_url, is_primary, display_order, category, caption) VALUES
    (prop_id, 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=1200&q=80', true, 0, 'exterior', 'Cliffside cottage'),
    (prop_id, 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=1200&q=80', false, 1, 'outdoor', 'Organic garden');

  ---------------------------------------------------------------------
  -- 11. Iloilo Organic Rice Farm — Iloilo (farm_experience / agrifarm)
  ---------------------------------------------------------------------
  INSERT INTO public.properties (
    host_id, name, description, location, address,
    latitude, longitude, price_per_night,
    max_guests, bedrooms, bathrooms,
    category, listing_type, subcategory,
    amenities, is_published
  ) VALUES (
    seed_host_id,
    '[SEED] Iloilo Organic Rice Farm',
    'Immersive day experience at an organic rice farm. Learn traditional planting methods, harvest vegetables, and cook a feast over an open fire.',
    'Oton, Iloilo',
    'Brgy. Tagbac, Oton',
    10.6974, 122.4812,
    1500, 8, 1, 1,
    'farmstay', 'farm_experience', 'agrifarm',
    ARRAY['Farm Tour', 'Farm Animals', 'Free Parking', 'Lunch Included'],
    true
  ) RETURNING id INTO prop_id;

  INSERT INTO public.property_images (property_id, image_url, is_primary, display_order, category, caption) VALUES
    (prop_id, 'https://images.unsplash.com/photo-1586771107445-d3af07f2d011?w=1200&q=80', true, 0, 'outdoor', 'Rice fields at dawn'),
    (prop_id, 'https://images.unsplash.com/photo-1600861195091-690c90f05567?w=1200&q=80', false, 1, 'outdoor', 'Farming tools');

  ---------------------------------------------------------------------
  -- 12. Guimaras Eco Lodge — Jordan (farm_stay / farm_cottage)
  ---------------------------------------------------------------------
  INSERT INTO public.properties (
    host_id, name, description, location, address,
    latitude, longitude, price_per_night,
    max_guests, bedrooms, bathrooms,
    category, listing_type, subcategory,
    amenities, is_published
  ) VALUES (
    seed_host_id,
    '[SEED] Guimaras Eco Lodge',
    'A sustainable eco-lodge nestled in a lush mango orchard. Solar-powered, zero-waste, and deeply connected to nature.',
    'Jordan, Guimaras',
    'San Miguel, Jordan',
    10.6550, 122.5850,
    3000, 4, 1, 1,
    'farmstay', 'farm_stay', 'farm_cottage',
    ARRAY['WiFi', 'Free Parking', 'Eco-friendly', 'Breakfast Included'],
    true
  ) RETURNING id INTO prop_id;

  INSERT INTO public.property_images (property_id, image_url, is_primary, display_order, category, caption) VALUES
    (prop_id, 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=1200&q=80', true, 0, 'exterior', 'Eco lodge in the trees'),
    (prop_id, 'https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?w=1200&q=80', false, 1, 'outdoor', 'Lush greenery');

  ---------------------------------------------------------------------
  -- 13. Hidden Cove Farm — Nueva Valencia (farm_stay / kubo_hut)
  ---------------------------------------------------------------------
  INSERT INTO public.properties (
    host_id, name, description, location, address,
    latitude, longitude, price_per_night,
    max_guests, bedrooms, bathrooms,
    category, listing_type, subcategory,
    amenities, is_published
  ) VALUES (
    seed_host_id,
    '[SEED] Hidden Cove Farm',
    'Rustic beachfront farm where the forest meets the sea. Perfect for disconnecting and enjoying quiet island life.',
    'Nueva Valencia, Guimaras',
    'Tando, Nueva Valencia',
    10.4900, 122.5500,
    2200, 2, 1, 1,
    'farmstay', 'farm_stay', 'kubo_hut',
    ARRAY['Beach Access', 'Free Parking', 'Outdoor Dining'],
    true
  ) RETURNING id INTO prop_id;

  INSERT INTO public.property_images (property_id, image_url, is_primary, display_order, category, caption) VALUES
    (prop_id, 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=1200&q=80', true, 0, 'exterior', 'Beachfront hut'),
    (prop_id, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80', false, 1, 'outdoor', 'Quiet cove');

  ---------------------------------------------------------------------
  -- 14. Cebu Mountain Retreat — Balamban (farm_stay / agrifarm)
  ---------------------------------------------------------------------
  INSERT INTO public.properties (
    host_id, name, description, location, address,
    latitude, longitude, price_per_night,
    max_guests, bedrooms, bathrooms,
    category, listing_type, subcategory,
    amenities, is_published
  ) VALUES (
    seed_host_id,
    '[SEED] Cebu Mountain Retreat',
    'A high-altitude retreat surrounded by vegetable terraces and pine trees. Wake up to the sea of clouds right outside your window.',
    'Balamban, Cebu',
    'Gaas, Balamban',
    10.4850, 123.7700,
    3500, 6, 2, 2,
    'farmstay', 'farm_stay', 'agrifarm',
    ARRAY['WiFi', 'Mountain View', 'Kitchen', 'Free Parking'],
    true
  ) RETURNING id INTO prop_id;

  INSERT INTO public.property_images (property_id, image_url, is_primary, display_order, category, caption) VALUES
    (prop_id, 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200&q=80', true, 0, 'exterior', 'Mountain cabin'),
    (prop_id, 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1200&q=80', false, 1, 'outdoor', 'Sea of clouds');

  ---------------------------------------------------------------------
  -- 15. Palawan Tropical Stay — El Nido (farm_stay / farm_cottage)
  ---------------------------------------------------------------------
  INSERT INTO public.properties (
    host_id, name, description, location, address,
    latitude, longitude, price_per_night,
    max_guests, bedrooms, bathrooms,
    category, listing_type, subcategory,
    amenities, is_published
  ) VALUES (
    seed_host_id,
    '[SEED] Palawan Tropical Stay',
    'Hidden amongst coconut groves near Lio Beach. Offers organic farm tours and a short bike ride to the white sand shores.',
    'El Nido, Palawan',
    'Villa Libertad, El Nido',
    11.2000, 119.4500,
    4000, 4, 1, 1,
    'farmstay', 'farm_stay', 'farm_cottage',
    ARRAY['WiFi', 'Beach Access', 'Farm Tour', 'Free Parking'],
    true
  ) RETURNING id INTO prop_id;

  INSERT INTO public.property_images (property_id, image_url, is_primary, display_order, category, caption) VALUES
    (prop_id, 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200&q=80', true, 0, 'exterior', 'Tropical cottage'),
    (prop_id, 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80', false, 1, 'outdoor', 'Coconut grove');

  ---------------------------------------------------------------------
  -- 16. Davao Durian Orchard — Davao City (farm_stay / agrifarm)
  ---------------------------------------------------------------------
  INSERT INTO public.properties (
    host_id, name, description, location, address,
    latitude, longitude, price_per_night,
    max_guests, bedrooms, bathrooms,
    category, listing_type, subcategory,
    amenities, is_published
  ) VALUES (
    seed_host_id,
    '[SEED] Davao Durian Orchard',
    'Experience the king of fruits at this working durian and pomelo orchard. Includes fruit tasting sessions and cozy modern farm accommodations.',
    'Davao City, Davao del Sur',
    'Calinan, Davao City',
    7.1500, 125.4500,
    3800, 5, 2, 1,
    'farmstay', 'farm_stay', 'agrifarm',
    ARRAY['WiFi', 'Kitchen', 'Free Parking', 'Farm Tour'],
    true
  ) RETURNING id INTO prop_id;

  INSERT INTO public.property_images (property_id, image_url, is_primary, display_order, category, caption) VALUES
    (prop_id, 'https://images.unsplash.com/photo-1587826315250-71101889a9f2?w=1200&q=80', true, 0, 'exterior', 'Modern farm house'),
    (prop_id, 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=1200&q=80', false, 1, 'outdoor', 'Durian trees');

  ---------------------------------------------------------------------
  -- Bulk Generation for UI Testing (5 per city)
  ---------------------------------------------------------------------
  DECLARE
    city_record RECORD;
    i INTEGER;
  BEGIN
    FOR city_record IN 
      SELECT * FROM (VALUES 
        ('Jordan, Guimaras', 'Jordan, Guimaras', 10.65, 122.59),
        ('Nueva Valencia, Guimaras', 'Nueva Valencia, Guimaras', 10.51, 122.57),
        ('Balamban, Cebu', 'Balamban, Cebu', 10.49, 123.77),
        ('El Nido, Palawan', 'El Nido, Palawan', 11.35, 119.53),
        ('Davao City, Davao del Sur', 'Davao City, Davao del Sur', 7.18, 125.40),
        ('Tagaytay, Cavite', 'Tagaytay, Cavite', 14.115, 120.962),
        ('Panglao, Bohol', 'Panglao, Bohol', 9.619, 123.801),
        ('Baguio, Benguet', 'Baguio, Benguet', 16.402, 120.596),
        ('San Lorenzo, Guimaras', 'San Lorenzo, Guimaras', 10.610, 122.620)
      ) AS t(loc, addr, lat, lng)
    LOOP
      FOR i IN 1..5 LOOP
        INSERT INTO public.properties (
          host_id, name, description, location, address,
          latitude, longitude, price_per_night,
          max_guests, bedrooms, bathrooms,
          category, listing_type, subcategory,
          amenities, is_published
        ) VALUES (
          seed_host_id,
          '[SEED] ' || split_part(city_record.loc, ',', 1) || ' Farm ' || i,
          'A beautiful sample farm located in ' || city_record.loc || '. Enjoy a relaxing stay with nature.',
          city_record.loc,
          city_record.addr,
          city_record.lat + (random() * 0.02 - 0.01), 
          city_record.lng + (random() * 0.02 - 0.01),
          2000 + (random() * 2000)::INT,
          4, 2, 1,
          'farmstay', 'farm_stay', 'agrifarm',
          ARRAY['WiFi', 'Free Parking', 'Farm Tour'],
          true
        ) RETURNING id INTO prop_id;

        INSERT INTO public.property_images (property_id, image_url, is_primary, display_order, category, caption) VALUES
          (prop_id, 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80', true, 0, 'exterior', 'Farm View ' || i),
          (prop_id, 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=600&q=80', false, 1, 'outdoor', 'Outdoor ' || i);
      END LOOP;
    END LOOP;
  END;

  RAISE NOTICE 'Seeded sample properties and bulk UI testing properties under host %', seed_host_id;
END $$;
