-- Restrict analyses table updates to service role only (admin operations)
DROP POLICY IF EXISTS "Anyone can update analyses" ON public.analyses;

-- Remove broad public listing on storage.objects for training-videos bucket.
-- Files remain accessible via public URL (bucket is public), but listing/enumeration is blocked.
DROP POLICY IF EXISTS "Public read training videos" ON storage.objects;