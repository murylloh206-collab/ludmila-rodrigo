-- Execute no Supabase: SQL Editor > New query > Run
-- Corrige upload de fotos e publicação de posts quando RLS bloqueia inserts.

-- Storage: bucket event-photos (leitura pública + upload permitido)
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-photos', 'event-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "event_photos_public_read" ON storage.objects;
CREATE POLICY "event_photos_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'event-photos');

DROP POLICY IF EXISTS "event_photos_public_insert" ON storage.objects;
CREATE POLICY "event_photos_public_insert"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'event-photos');

DROP POLICY IF EXISTS "event_photos_public_update" ON storage.objects;
CREATE POLICY "event_photos_public_update"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'event-photos')
WITH CHECK (bucket_id = 'event-photos');

DROP POLICY IF EXISTS "event_photos_public_delete" ON storage.objects;
CREATE POLICY "event_photos_public_delete"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'event-photos');

-- Posts: permitir criação/leitura pelo app (API valida user_id no servidor)
DROP POLICY IF EXISTS "posts_public_select" ON posts;
CREATE POLICY "posts_public_select"
ON posts FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "posts_public_insert" ON posts;
CREATE POLICY "posts_public_insert"
ON posts FOR INSERT
TO public
WITH CHECK (true);
