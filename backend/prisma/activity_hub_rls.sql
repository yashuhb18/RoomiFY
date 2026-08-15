-- ─── Activity Hub RLS Policies ───────────────────────────────────────────────
-- These use the same helper functions (current_user_id, current_user_role, current_hostel_id)
-- defined in rls_policies.sql.

-- Enable RLS on new tables
ALTER TABLE "credit_accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "credit_transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "task_completions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "achievements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_achievements" ENABLE ROW LEVEL SECURITY;

-- ─── Credit Accounts ───
-- Users can view their own credit account
CREATE POLICY credit_accounts_view_self ON "credit_accounts" FOR SELECT USING (
  "userId" = current_user_id()
);
-- Wardens can view credit accounts of users in their hostel (via join)
CREATE POLICY credit_accounts_view_hostel ON "credit_accounts" FOR SELECT USING (
  current_user_role() IN ('WARDEN', 'STAFF') AND EXISTS (
    SELECT 1 FROM "users" u WHERE u.id = "credit_accounts"."userId" AND u."hostelId" = current_hostel_id()
  )
);
-- Super admins see all
CREATE POLICY credit_accounts_super_admin ON "credit_accounts" FOR SELECT USING (
  current_user_role() = 'SUPER_ADMIN'
);
-- System can insert/update (for credit awards)
CREATE POLICY credit_accounts_insert ON "credit_accounts" FOR INSERT WITH CHECK (true);
CREATE POLICY credit_accounts_update ON "credit_accounts" FOR UPDATE USING (true);

-- ─── Credit Transactions ───
-- Users can view their own transactions
CREATE POLICY credit_tx_view_self ON "credit_transactions" FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM "credit_accounts" ca WHERE ca.id = "credit_transactions"."accountId" AND ca."userId" = current_user_id()
  )
);
-- Super admins see all
CREATE POLICY credit_tx_super_admin ON "credit_transactions" FOR SELECT USING (
  current_user_role() = 'SUPER_ADMIN'
);
-- System can insert
CREATE POLICY credit_tx_insert ON "credit_transactions" FOR INSERT WITH CHECK (true);

-- ─── Tasks ───
-- All authenticated users can view task definitions
CREATE POLICY tasks_view_all ON "tasks" FOR SELECT USING (true);
-- Only super admins can modify tasks
CREATE POLICY tasks_admin_all ON "tasks" FOR ALL USING (
  current_user_role() = 'SUPER_ADMIN'
);

-- ─── Task Completions ───
-- Users can view their own completions
CREATE POLICY task_completions_view_self ON "task_completions" FOR SELECT USING (
  "userId" = current_user_id()
);
-- Wardens can view completions in their hostel
CREATE POLICY task_completions_view_hostel ON "task_completions" FOR SELECT USING (
  current_user_role() IN ('WARDEN', 'STAFF') AND EXISTS (
    SELECT 1 FROM "users" u WHERE u.id = "task_completions"."userId" AND u."hostelId" = current_hostel_id()
  )
);
-- Super admins see all
CREATE POLICY task_completions_super_admin ON "task_completions" FOR SELECT USING (
  current_user_role() = 'SUPER_ADMIN'
);
-- System can insert/update
CREATE POLICY task_completions_insert ON "task_completions" FOR INSERT WITH CHECK (true);
CREATE POLICY task_completions_update ON "task_completions" FOR UPDATE USING (true);

-- ─── Achievements ───
-- All authenticated users can view achievements
CREATE POLICY achievements_view_all ON "achievements" FOR SELECT USING (true);
-- System can insert
CREATE POLICY achievements_insert ON "achievements" FOR INSERT WITH CHECK (true);

-- ─── User Achievements ───
-- Users can view their own achievements
CREATE POLICY user_achievements_view_self ON "user_achievements" FOR SELECT USING (
  "userId" = current_user_id()
);
-- All users can view others' achievements (for leaderboard badges)
CREATE POLICY user_achievements_view_all ON "user_achievements" FOR SELECT USING (true);
-- System can insert
CREATE POLICY user_achievements_insert ON "user_achievements" FOR INSERT WITH CHECK (true);
