
-- Fix 1: Remove partner direct SELECT on cycle_data to enforce granular sharing via RPC only
DROP POLICY IF EXISTS "Partners can view shared cycle data" ON public.cycle_data;

-- Fix 2: Remove partner direct SELECT on partner_links base table (they use the view instead)
DROP POLICY IF EXISTS "Partners can view links they're connected to" ON public.partner_links;

-- Fix 3: Recreate the partner_links_partner_view as SECURITY DEFINER so it doesn't need base table RLS
DROP VIEW IF EXISTS public.partner_links_partner_view;

CREATE VIEW public.partner_links_partner_view
WITH (security_invoker = false)
AS
SELECT
  id,
  owner_id,
  partner_id,
  share_cycle_info,
  share_flow_intensity,
  share_mood,
  share_symptoms,
  share_fertility,
  status,
  created_at,
  updated_at
FROM public.partner_links
WHERE partner_id = auth.uid()
  AND status = 'active';

-- Grant select on the view to authenticated users
GRANT SELECT ON public.partner_links_partner_view TO authenticated;
