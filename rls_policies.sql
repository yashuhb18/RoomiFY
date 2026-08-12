-- ============================================================================
-- AEGIS HOSTEL - PostgreSQL Row Level Security (RLS) Policies
-- Multi-Tenant Zero-Trust Data Isolation Script
-- ============================================================================

-- 1. Enable Row Level Security on all core tables
ALTER TABLE hostels ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. USERS TABLE POLICY
DROP POLICY IF EXISTS tenant_isolation_users ON users;
CREATE POLICY tenant_isolation_users ON users
    FOR ALL
    USING (
        "hostelId" = current_setting('app.current_hostel', true)
    );

-- 3. ROOMS TABLE POLICY
DROP POLICY IF EXISTS tenant_isolation_rooms ON rooms;
CREATE POLICY tenant_isolation_rooms ON rooms
    FOR ALL
    USING (
        "hostelId" = current_setting('app.current_hostel', true)
    );

-- 4. BOOKINGS TABLE POLICY
DROP POLICY IF EXISTS tenant_isolation_bookings ON bookings;
CREATE POLICY tenant_isolation_bookings ON bookings
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM rooms r
            WHERE r.id = bookings."roomId"
              AND r."hostelId" = current_setting('app.current_hostel', true)
        )
    );

-- 5. TICKETS TABLE POLICY
DROP POLICY IF EXISTS tenant_isolation_tickets ON tickets;
CREATE POLICY tenant_isolation_tickets ON tickets
    FOR ALL
    USING (
        "hostelId" = current_setting('app.current_hostel', true)
    );

-- 6. MARKETPLACE ITEMS POLICY
DROP POLICY IF EXISTS tenant_isolation_marketplace ON marketplace_items;
CREATE POLICY tenant_isolation_marketplace ON marketplace_items
    FOR ALL
    USING (
        "hostelId" = current_setting('app.current_hostel', true)
    );

-- 7. AUDIT LOGS POLICY
DROP POLICY IF EXISTS tenant_isolation_audit ON audit_logs;
CREATE POLICY tenant_isolation_audit ON audit_logs
    FOR SELECT
    USING (
        "hostelId" = current_setting('app.current_hostel', true)
    );
