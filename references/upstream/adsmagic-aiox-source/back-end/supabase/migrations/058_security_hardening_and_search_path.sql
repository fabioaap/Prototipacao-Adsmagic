-- Migration 058: Security hardening for RLS, materialized views and function search_path
-- Date: 2026-02-14

BEGIN;

-- ============================================================================
-- 1) Harden permissive RLS policies (companies, dashboard_cache, link_accesses)
-- ============================================================================

-- Companies
DROP POLICY IF EXISTS companies_select_policy ON public.companies;
DROP POLICY IF EXISTS companies_create_policy ON public.companies;
DROP POLICY IF EXISTS companies_update_policy ON public.companies;
DROP POLICY IF EXISTS companies_delete_policy ON public.companies;

CREATE POLICY companies_select_policy
  ON public.companies
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.company_users cu
      WHERE cu.company_id = companies.id
        AND cu.user_id = (SELECT auth.uid())
        AND cu.is_active = true
    )
  );

-- companies has no created_by; INSERT allowed for authenticated (app adds owner via company_users)
CREATE POLICY companies_create_policy
  ON public.companies
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY companies_update_policy
  ON public.companies
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.company_users cu
      WHERE cu.company_id = companies.id
        AND cu.user_id = (SELECT auth.uid())
        AND cu.is_active = true
        AND cu.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.company_users cu
      WHERE cu.company_id = companies.id
        AND cu.user_id = (SELECT auth.uid())
        AND cu.is_active = true
        AND cu.role IN ('owner', 'admin')
    )
  );

CREATE POLICY companies_delete_policy
  ON public.companies
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.company_users cu
      WHERE cu.company_id = companies.id
        AND cu.user_id = (SELECT auth.uid())
        AND cu.is_active = true
        AND cu.role = 'owner'
    )
  );

-- Dashboard cache
DROP POLICY IF EXISTS "Functions can manage dashboard_cache" ON public.dashboard_cache;
DROP POLICY IF EXISTS "Users can view dashboard_cache in their projects" ON public.dashboard_cache;

CREATE POLICY "Users can view dashboard_cache in their projects"
  ON public.dashboard_cache
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.project_users pu
      WHERE pu.project_id = dashboard_cache.project_id
        AND pu.user_id = (SELECT auth.uid())
        AND pu.is_active = true
    )
  );

CREATE POLICY "Service role can manage dashboard_cache"
  ON public.dashboard_cache
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Link accesses public insert: keep anonymous tracking, but validate link/project consistency
DROP POLICY IF EXISTS link_accesses_insert_public_policy ON public.link_accesses;

CREATE POLICY link_accesses_insert_public_policy
  ON public.link_accesses
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    link_id IS NOT NULL
    AND project_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.trackable_links tl
      WHERE tl.id = link_accesses.link_id
        AND tl.project_id = link_accesses.project_id
        AND tl.is_active = true
    )
  );

-- Reduce duplicate permissive policy overhead on company_users SELECT
DROP POLICY IF EXISTS company_users_select_policy ON public.company_users;

-- ============================================================================
-- 2) Restrict materialized views from Data API roles
-- ============================================================================
REVOKE ALL ON TABLE public.mv_dashboard_summary_metrics FROM anon, authenticated;
REVOKE ALL ON TABLE public.mv_dashboard_funnel_stats FROM anon, authenticated;
REVOKE ALL ON TABLE public.mv_dashboard_origin_breakdown FROM anon, authenticated;
REVOKE ALL ON TABLE public.mv_dashboard_pipeline_stats FROM anon, authenticated;

GRANT SELECT ON TABLE public.mv_dashboard_summary_metrics TO service_role;
GRANT SELECT ON TABLE public.mv_dashboard_funnel_stats TO service_role;
GRANT SELECT ON TABLE public.mv_dashboard_origin_breakdown TO service_role;
GRANT SELECT ON TABLE public.mv_dashboard_pipeline_stats TO service_role;

-- ============================================================================
-- 3) Fix mutable search_path on SECURITY DEFINER / trigger functions flagged by advisors
-- ============================================================================
ALTER FUNCTION public.attribute_contact_to_link_access() SET search_path TO public, extensions, pg_catalog;
ALTER FUNCTION public.cleanup_expired_cache() SET search_path TO public, extensions, pg_catalog;
ALTER FUNCTION public.create_conversion_event_on_sale() SET search_path TO public, extensions, pg_catalog;
ALTER FUNCTION public.create_sale_on_contact_stage_sale() SET search_path TO public, extensions, pg_catalog;
ALTER FUNCTION public.decrement_link_clicks_count() SET search_path TO public, extensions, pg_catalog;
ALTER FUNCTION public.decrement_link_contacts_count() SET search_path TO public, extensions, pg_catalog;
ALTER FUNCTION public.decrement_link_sales_count() SET search_path TO public, extensions, pg_catalog;
ALTER FUNCTION public.decrypt_token(text, text) SET search_path TO public, extensions, pg_catalog;
ALTER FUNCTION public.encrypt_token(text, text) SET search_path TO public, extensions, pg_catalog;
ALTER FUNCTION public.generate_params_hash(jsonb) SET search_path TO public, extensions, pg_catalog;
ALTER FUNCTION public.get_dashboard_cache(uuid, character varying, character varying) SET search_path TO public, extensions, pg_catalog;
ALTER FUNCTION public.invalidate_cache_on_contacts_change() SET search_path TO public, extensions, pg_catalog;
ALTER FUNCTION public.invalidate_cache_on_origins_change() SET search_path TO public, extensions, pg_catalog;
ALTER FUNCTION public.invalidate_cache_on_sales_change() SET search_path TO public, extensions, pg_catalog;
ALTER FUNCTION public.invalidate_cache_on_stage_history_change() SET search_path TO public, extensions, pg_catalog;
ALTER FUNCTION public.invalidate_cache_on_stages_change() SET search_path TO public, extensions, pg_catalog;
ALTER FUNCTION public.invalidate_dashboard_cache(uuid, character varying) SET search_path TO public, extensions, pg_catalog;
ALTER FUNCTION public.log_contact_stage_change() SET search_path TO public, extensions, pg_catalog;
ALTER FUNCTION public.log_origin_added_activity() SET search_path TO public, extensions, pg_catalog;
ALTER FUNCTION public.log_sale_activity() SET search_path TO public, extensions, pg_catalog;
ALTER FUNCTION public.log_stage_change_activity() SET search_path TO public, extensions, pg_catalog;
ALTER FUNCTION public.refresh_analytics_materialized_views(text, text) SET search_path TO public, extensions, pg_catalog;
ALTER FUNCTION public.set_dashboard_cache(uuid, character varying, character varying, jsonb, integer) SET search_path TO public, extensions, pg_catalog;
ALTER FUNCTION public.sync_contact_origin_critical_fields() SET search_path TO public, extensions, pg_catalog;
ALTER FUNCTION public.update_contacts_updated_at() SET search_path TO public, extensions, pg_catalog;
ALTER FUNCTION public.update_dashboard_cache_updated_at() SET search_path TO public, extensions, pg_catalog;
ALTER FUNCTION public.update_link_clicks_count() SET search_path TO public, extensions, pg_catalog;
ALTER FUNCTION public.update_link_contacts_count() SET search_path TO public, extensions, pg_catalog;
ALTER FUNCTION public.update_link_sales_count() SET search_path TO public, extensions, pg_catalog;
ALTER FUNCTION public.update_link_sales_on_status_change() SET search_path TO public, extensions, pg_catalog;
ALTER FUNCTION public.update_messaging_updated_at() SET search_path TO public, extensions, pg_catalog;

COMMIT;
