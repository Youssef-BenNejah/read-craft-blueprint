
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS images text[] NOT NULL DEFAULT '{}';

INSERT INTO storage.buckets (id, name, public)
VALUES ('ticket-images', 'ticket-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read ticket-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'ticket-images');

CREATE POLICY "Public insert ticket-images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'ticket-images');

CREATE POLICY "Public update ticket-images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'ticket-images');

CREATE POLICY "Public delete ticket-images"
ON storage.objects FOR DELETE
USING (bucket_id = 'ticket-images');
