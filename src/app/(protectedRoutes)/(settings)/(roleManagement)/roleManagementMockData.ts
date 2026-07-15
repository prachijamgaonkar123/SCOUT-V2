export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

/* ---------- FEATURES ---------- */

export const mockFeatures = [
  { feature_id: "SF001", name: "Safety & Compliance Dashboard", description: "View safety and compliance analytics dashboards." },
  { feature_id: "SF002", name: "Surveillance Monitoring Dashboard", description: "View surveillance monitoring analytics dashboards." },
  { feature_id: "SF003", name: "Operational Insights Dashboard", description: "View operational insights analytics dashboards." },
  { feature_id: "SF004", name: "Workforce Monitoring Dashboard", description: "View workforce monitoring analytics dashboards." },
  { feature_id: "SF006", name: "Role Management", description: "Create, edit, and manage roles and permissions." },
  { feature_id: "SF007", name: "User Management", description: "Create, edit, and manage organization users." },
  { feature_id: "SF009", name: "Live Streaming", description: "View live camera streams." },
  { feature_id: "SF015", name: "Use-Case Manager", description: "Configure and assign cameras to AI use cases." },
  { feature_id: "SF016", name: "Zone-Location Mapping", description: "Manage zones and locations." },
  { feature_id: "SF017", name: "Camera Management", description: "Onboard and configure cameras." },
  { feature_id: "SF022", name: "Alert Configuration", description: "Configure per-user alert subscriptions and channels." },
  { feature_id: "SF018", name: "Create Role", description: "Create new roles." },
  { feature_id: "SF019", name: "View Role", description: "View role details." },
  { feature_id: "SF020", name: "Delete Role", description: "Delete roles." },
  { feature_id: "SF021", name: "Edit Role", description: "Edit role permissions." },
  { feature_id: "SF010", name: "Add User", description: "Add new users to the organization." },
  { feature_id: "SF011", name: "Edit User", description: "Edit existing user details." },
  { feature_id: "SF012", name: "Delete User", description: "Remove users from the organization." },
  { feature_id: "SF013", name: "View User", description: "View user details." },
];

/* ---------- ROLES ---------- */

export const mockOrgAppRoles = [
  {
    org_app_role_id: "org-role-1",
    createdAt: "2026-05-01T09:00:00Z",
    updatedAt: "2026-06-20T09:00:00Z",
    role_id: { role_id: "role-1", name: "Admin" },
  },
  {
    org_app_role_id: "org-role-2",
    createdAt: "2026-05-05T09:00:00Z",
    updatedAt: "2026-06-10T09:00:00Z",
    role_id: { role_id: "role-2", name: "Safety Manager" },
  },
  {
    org_app_role_id: "org-role-3",
    createdAt: "2026-05-10T09:00:00Z",
    updatedAt: "2026-06-05T09:00:00Z",
    role_id: { role_id: "role-3", name: "Supervisor" },
  },
  {
    org_app_role_id: "org-role-4",
    createdAt: "2026-05-15T09:00:00Z",
    updatedAt: "2026-05-15T09:00:00Z",
    role_id: { role_id: "role-4", name: "Operator" },
  },
];

/* ---------- ROLE → ASSIGNED FEATURES ---------- */

export const mockAssignedFeatureIdsByRole: Record<string, string[]> = {
  "org-role-1": mockFeatures.map((f) => f.feature_id),
  "org-role-2": ["SF001", "SF002", "SF017", "SF015", "SF022", "SF019"],
  "org-role-3": ["SF001", "SF004", "SF009", "SF019"],
  "org-role-4": ["SF009", "SF019"],
};

export const getMockAssignedFeatures = (orgAppRoleId: string | undefined) => {
  const ids = (orgAppRoleId && mockAssignedFeatureIdsByRole[orgAppRoleId]) || [];
  return mockFeatures.filter((f) => ids.includes(f.feature_id));
};

/* ---------- MOCK MUTATIONS ---------- */
// Mutating the shared arrays in place (rather than reassigning) lets every
// page that imports them — RoleOverview, ViewRole, EditRole — see the same
// data across client-side navigations, without a real backend. A full page
// refresh re-evaluates the module and resets everything back to the seed data.

export const addMockRole = (roleName: string) => {
  const now = new Date().toISOString();
  const newRole = {
    org_app_role_id: `org-role-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
    role_id: { role_id: `role-${Date.now()}`, name: roleName },
  };
  mockOrgAppRoles.push(newRole);
  return newRole;
};

export const removeMockRole = (roleId: string) => {
  const index = mockOrgAppRoles.findIndex((r) => r.role_id.role_id === roleId);
  if (index === -1) return;
  const [removed] = mockOrgAppRoles.splice(index, 1);
  delete mockAssignedFeatureIdsByRole[removed.org_app_role_id];
};

export const setMockAssignedFeatures = (orgAppRoleId: string, featureIds: string[]) => {
  mockAssignedFeatureIdsByRole[orgAppRoleId] = featureIds;
  const role = mockOrgAppRoles.find((r) => r.org_app_role_id === orgAppRoleId);
  if (role) role.updatedAt = new Date().toISOString();
};

/* ---------- ENVELOPE HELPER ---------- */

// Mirrors the { status, message, data: { status, message, data: T } } shape
// every role-information endpoint responds with.
export const mockEnvelope = <T>(data: T) => ({
  status: "success",
  message: "Mock data",
  data: {
    status: "success",
    message: "Mock data",
    data,
  },
});
