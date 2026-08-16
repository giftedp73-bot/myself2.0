REVOKE ALL ON public.app_user_connections FROM anon, authenticated;
GRANT ALL ON public.app_user_connections TO service_role;
ALTER TABLE public.app_user_connections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "No client access to connection credentials" ON public.app_user_connections;
CREATE POLICY "No client access to connection credentials"
ON public.app_user_connections
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);