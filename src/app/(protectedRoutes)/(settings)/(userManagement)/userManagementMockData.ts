import { mockUsers as mockAlertUsers } from "@/app/components/organisms/configurator/alert-configuration/alertConfigMockData";
import { mockOrgAppRoles } from "../(roleManagement)/roleManagementMockData";
import type { BackendUser } from "./userOverview/UserOverviewApi";

export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

const findOrgAppRoleIdByName = (roleName: string): string =>
  mockOrgAppRoles.find(
    (r) => r.role_id.name.toLowerCase() === roleName.toLowerCase()
  )?.org_app_role_id ?? (mockOrgAppRoles[0]?.org_app_role_id ?? "");

// Same identities (id, name, email, role) as Alert Configuration's mock
// users, so a user shown here is the same user Alert Configuration lists.
export const mockBackendUsers: BackendUser[] = mockAlertUsers.map((u) => ({
  userId: u.id,
  first_name: u.firstName,
  last_name: u.lastName,
  email: u.email,
  phoneNumber: u.phone,
  createdAt: "2026-05-01T09:00:00Z",
  updatedAt: "2026-05-01T09:00:00Z",
  roleName: u.roleName,
}));

type MockUserDetails = {
  employee_id: string;
  userName: string;
  image_path?: string;
};

export const mockUserDetailsById: Record<string, MockUserDetails> =
  Object.fromEntries(
    mockBackendUsers.map((u, index) => [
      u.userId,
      {
        employee_id: `EMP-${1000 + index}`,
        userName: `${(u.first_name ?? "").toLowerCase()}.${(u.last_name ?? "").toLowerCase()}`,
      },
    ])
  );

export const mockOrgAppRoleIdByUserId: Record<string, string> =
  Object.fromEntries(
    mockBackendUsers.map((u) => [u.userId, findOrgAppRoleIdByName(u.roleName ?? "")])
  );

export type MockUserFormInput = {
  firstName: string;
  lastName: string;
  email: string;
  employeeId: string;
  phone: string;
  userName: string;
  orgAppRoleId: string;
};

/* ---------- MOCK MUTATIONS ---------- */
// Mutating the shared arrays/records in place lets every page that imports
// them — UserOverview, AddUser, EditUser, ViewUser — see the same data
// across client-side navigations, without a real backend. A full page
// refresh re-evaluates the module and resets everything back to the seed data.

export const addMockBackendUser = (input: MockUserFormInput): BackendUser => {
  const now = new Date().toISOString();
  const role = mockOrgAppRoles.find((r) => r.org_app_role_id === input.orgAppRoleId);

  const newUser: BackendUser = {
    userId: `user-${Date.now()}`,
    first_name: input.firstName,
    last_name: input.lastName,
    email: input.email,
    phoneNumber: input.phone,
    createdAt: now,
    updatedAt: now,
    roleName: role?.role_id.name ?? "",
  };

  mockBackendUsers.push(newUser);
  mockUserDetailsById[newUser.userId] = {
    employee_id: input.employeeId,
    userName: input.userName,
  };
  mockOrgAppRoleIdByUserId[newUser.userId] = input.orgAppRoleId;

  return newUser;
};

export const removeMockBackendUser = (targetUserId: string) => {
  const index = mockBackendUsers.findIndex((u) => u.userId === targetUserId);
  if (index !== -1) mockBackendUsers.splice(index, 1);
  delete mockUserDetailsById[targetUserId];
  delete mockOrgAppRoleIdByUserId[targetUserId];
};

export const updateMockBackendUser = (
  targetUserId: string,
  input: MockUserFormInput
) => {
  const user = mockBackendUsers.find((u) => u.userId === targetUserId);
  if (!user) return;

  const role = mockOrgAppRoles.find((r) => r.org_app_role_id === input.orgAppRoleId);

  user.first_name = input.firstName;
  user.last_name = input.lastName;
  user.email = input.email;
  user.phoneNumber = input.phone;
  user.roleName = role?.role_id.name ?? user.roleName;
  user.updatedAt = new Date().toISOString();

  mockUserDetailsById[targetUserId] = {
    ...mockUserDetailsById[targetUserId],
    employee_id: input.employeeId,
    userName: input.userName,
  };
  mockOrgAppRoleIdByUserId[targetUserId] = input.orgAppRoleId;
};
