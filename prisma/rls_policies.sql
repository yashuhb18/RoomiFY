-- Enable RLS on core tables
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tickets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bookings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "marketplace_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;

-- Create helper function to get current user ID, role, and hostel ID from session context
CREATE OR REPLACE FUNCTION current_user_id() RETURNS TEXT AS $$
  BEGIN
    RETURN current_setting('app.current_user_id', true);
  EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
  END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION current_user_role() RETURNS TEXT AS $$
  BEGIN
    RETURN current_setting('app.current_user_role', true);
  EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
  END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION current_hostel_id() RETURNS TEXT AS $$
  BEGIN
    RETURN current_setting('app.current_hostel_id', true);
  EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
  END;
$$ LANGUAGE plpgsql STABLE;

-- ─── Users Table Policies ───
-- A user can see themselves
CREATE POLICY users_view_self ON "users" FOR SELECT USING (id = current_user_id());
-- Wardens/Staff can view users in their hostel
CREATE POLICY users_view_hostel ON "users" FOR SELECT USING (
  (current_user_role() IN ('WARDEN', 'STAFF') AND hostelId = current_hostel_id()) OR current_user_role() = 'SUPER_ADMIN'
);
-- Users can update themselves
CREATE POLICY users_update_self ON "users" FOR UPDATE USING (id = current_user_id());

-- ─── Tickets Table Policies ───
-- Students can view their own tickets
CREATE POLICY tickets_student_select ON "tickets" FOR SELECT USING (
  current_user_role() = 'STUDENT' AND studentId = current_user_id()
);
-- Wardens/Staff can view tickets in their hostel
CREATE POLICY tickets_staff_select ON "tickets" FOR SELECT USING (
  current_user_role() IN ('WARDEN', 'STAFF') AND hostelId = current_hostel_id()
);
-- Super admins can view all tickets
CREATE POLICY tickets_super_admin_select ON "tickets" FOR SELECT USING (current_user_role() = 'SUPER_ADMIN');

-- Students can insert their own tickets
CREATE POLICY tickets_student_insert ON "tickets" FOR INSERT WITH CHECK (
  current_user_role() = 'STUDENT' AND studentId = current_user_id()
);

-- Students can update their own tickets (except status, but RLS just checks row ownership)
CREATE POLICY tickets_student_update ON "tickets" FOR UPDATE USING (
  current_user_role() = 'STUDENT' AND studentId = current_user_id()
);
-- Wardens/Staff can update tickets in their hostel
CREATE POLICY tickets_staff_update ON "tickets" FOR UPDATE USING (
  current_user_role() IN ('WARDEN', 'STAFF') AND hostelId = current_hostel_id()
);

-- ─── Bookings Table Policies ───
CREATE POLICY bookings_select_self ON "bookings" FOR SELECT USING (
  current_user_role() = 'STUDENT' AND studentId = current_user_id()
);
CREATE POLICY bookings_select_staff ON "bookings" FOR SELECT USING (
  current_user_role() IN ('WARDEN', 'STAFF')
);
CREATE POLICY bookings_insert_self ON "bookings" FOR INSERT WITH CHECK (
  studentId = current_user_id()
);

-- ─── Marketplace Items Policies ───
-- Anyone can view marketplace items in their hostel
CREATE POLICY marketplace_select ON "marketplace_items" FOR SELECT USING (
  hostelId = current_hostel_id()
);
-- Students can insert their own items
CREATE POLICY marketplace_insert ON "marketplace_items" FOR INSERT WITH CHECK (
  sellerId = current_user_id()
);
-- Students can update/delete their own items
CREATE POLICY marketplace_update_delete ON "marketplace_items" FOR ALL USING (
  sellerId = current_user_id() OR current_user_role() IN ('WARDEN', 'SUPER_ADMIN')
);

-- ─── Audit Logs Policies ───
-- Only wardens and super admins can view audit logs
CREATE POLICY audit_logs_select ON "audit_logs" FOR SELECT USING (
  (current_user_role() = 'WARDEN' AND hostelId = current_hostel_id()) OR current_user_role() = 'SUPER_ADMIN'
);
-- System needs to insert audit logs (bypasses RLS if using superuser, but Prisma uses normal user usually)
-- Allow inserts globally for now to not break logging, but no reading
CREATE POLICY audit_logs_insert ON "audit_logs" FOR INSERT WITH CHECK (true);

-- To allow Prisma migrations and background jobs to bypass RLS, we can define a BYPASSRLS role
-- Or just rely on the database superuser for migrations.
