-- FuelLK Supabase Schema and RLS Policies

-- 1. Create Tables
CREATE TABLE sheds (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  name text NOT NULL,
  address text NOT NULL,
  district text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  fuel_petrol boolean DEFAULT true,
  fuel_diesel boolean DEFAULT true,
  fuel_kerosene boolean DEFAULT false,
  source text DEFAULT 'public'     -- 'public' or 'admin'
);

CREATE TABLE fuel_updates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  shed_id uuid REFERENCES sheds(id) ON DELETE CASCADE NOT NULL,
  fuel_type text NOT NULL,        -- 'petrol', 'diesel', 'kerosene'
  status text NOT NULL,           -- 'available', 'unavailable'
  queue text NOT NULL             -- 'short', 'medium', 'long'
);

-- 2. Create Views for latest report per shed
CREATE VIEW sheds_with_latest_report AS
SELECT 
  s.*,
  (
    SELECT json_build_object(
      'status', fu.status,
      'queue', fu.queue,
      'updated_at', fu.created_at
    )
    FROM fuel_updates fu
    WHERE fu.shed_id = s.id
    ORDER BY fu.created_at DESC
    LIMIT 1
  ) as latestReport
FROM sheds s;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE sheds ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_updates ENABLE ROW LEVEL SECURITY;

-- 4. Policies limit: allow public reading and inserting anonymously
-- (For proper production apps, anonymous inserts should be rate-limited by IP/fingerprint to prevent spam)
CREATE POLICY "Allow public read access for sheds" ON sheds FOR SELECT USING (true);
CREATE POLICY "Allow public insert for sheds" ON sheds FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access for updates" ON fuel_updates FOR SELECT USING (true);
CREATE POLICY "Allow public insert for updates" ON fuel_updates FOR INSERT WITH CHECK (true);

-- 5. Enable Real-Time
ALTER PUBLICATION supabase_realtime ADD TABLE sheds;
ALTER PUBLICATION supabase_realtime ADD TABLE fuel_updates;
