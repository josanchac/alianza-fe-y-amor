# Pilot administration privacy boundary

The app administrator sees enrollment email, account activation, last active calendar date, active-day counts (7/30), and total accounts/couples. One authenticated foreground opening is counted per Costa Rica calendar day. Tracking starts with this release; no historical content is mined. No exact times, screens, action names, spiritual completion, private profile settings or content are collected by this feature.

The user-facing `alianza_admin_activity` RPC accepts no target user or query parameters. Authorization comes from the private admin membership table on every request, independent of user-editable claims. Only José's existing account is enrolled; deployment enrollment is not included in public source. No invitation, password reset, impersonation or content-editing capabilities exist in this dashboard.

`alianza_metrics` is a NOLOGIN, NOINHERIT role owning the private metric functions. It cannot read `records`, backups, names or ideals, or full Auth rows. Two tightly scoped private bridges owned by the database deployment role supply current authenticated identity and membership account metadata from the managed Auth schema. Only the metrics role can execute these bridges. Public wrappers are SECURITY INVOKER. All functions have fixed empty search paths and explicit execute grants. The app's existing personal data RPC and sharing rules are unchanged.

Operational limitation: this restricts the application administrator. An infrastructure owner with Supabase SQL/admin credentials still has database privileges. This feature is not end-to-end encryption and does not remove the owner's infrastructure access.

Tests cover admin/nonadmin/anonymous/revoked access, enrollment validation, deduplicated tracking, exact response fields, inability of the metrics role to read personal content, unchanged spouse and cross-couple boundaries, stale UI removal on rejection, and draft preservation when switching views. Production checks use rolled-back transactions, without reading real spiritual content or consuming users' login links.
