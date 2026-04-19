-- Migration 059: Replace raw auth.uid() calls in RLS policies with (select auth.uid())
-- Date: 2026-02-14

BEGIN;

DO $$
DECLARE
  rec RECORD;
  roles_sql TEXT;
  qual_sql TEXT;
  check_sql TEXT;
  create_sql TEXT;
BEGIN
  FOR rec IN
    SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (
        COALESCE(qual, '') LIKE '%auth.uid()%'
        OR COALESCE(with_check, '') LIKE '%auth.uid()%'
      )
  LOOP
    -- Keep already optimized fragments stable.
    qual_sql := REPLACE(REPLACE(COALESCE(rec.qual, ''), '(select auth.uid())', '__AUTH_UID_OPT__'), 'auth.uid()', '(select auth.uid())');
    qual_sql := REPLACE(qual_sql, '__AUTH_UID_OPT__', '(select auth.uid())');
    IF qual_sql = '' THEN
      qual_sql := NULL;
    END IF;

    check_sql := REPLACE(REPLACE(COALESCE(rec.with_check, ''), '(select auth.uid())', '__AUTH_UID_OPT__'), 'auth.uid()', '(select auth.uid())');
    check_sql := REPLACE(check_sql, '__AUTH_UID_OPT__', '(select auth.uid())');
    IF check_sql = '' THEN
      check_sql := NULL;
    END IF;

    SELECT string_agg(
      CASE
        WHEN r = 'public' THEN 'PUBLIC'
        ELSE quote_ident(r)
      END,
      ', '
    )
      INTO roles_sql
    FROM unnest(rec.roles) AS r;

    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', rec.policyname, rec.schemaname, rec.tablename);

    create_sql := format(
      'CREATE POLICY %I ON %I.%I AS %s FOR %s TO %s',
      rec.policyname,
      rec.schemaname,
      rec.tablename,
      rec.permissive,
      rec.cmd,
      roles_sql
    );

    IF qual_sql IS NOT NULL THEN
      create_sql := create_sql || format(' USING (%s)', qual_sql);
    END IF;

    IF check_sql IS NOT NULL THEN
      create_sql := create_sql || format(' WITH CHECK (%s)', check_sql);
    END IF;

    EXECUTE create_sql;
  END LOOP;
END $$;

COMMIT;
