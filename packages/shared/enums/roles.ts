/**
 * Role Enum System
 *
 * Numeric representation of user roles for the Demand Management Portal.
 * Lower numbers indicate higher privilege levels.
 *
 * @see ROLES.md for detailed documentation
 */

export enum UserRoleEnum {
  SUPER_ADMIN = 1,
  ADMIN = 2,
  DM_APPROVER = 3,
  DM_REQUESTOR = 4,
  EMPLOYEE = 5,
  DM_WATCHER = 6,
}

/**
 * Role display names mapping
 */
export const RoleDisplayNames: Record<UserRoleEnum, string> = {
  [UserRoleEnum.SUPER_ADMIN]: "Super Admin",
  [UserRoleEnum.ADMIN]: "Admin",
  [UserRoleEnum.DM_APPROVER]: "DM Approver",
  [UserRoleEnum.DM_REQUESTOR]: "DM Requestor",
  [UserRoleEnum.EMPLOYEE]: "Employee",
  [UserRoleEnum.DM_WATCHER]: "DM Watcher",
};

/**
 * Backend API role names mapping (wire format)
 */
export const RoleApiNames: Record<UserRoleEnum, string> = {
  [UserRoleEnum.SUPER_ADMIN]: "super_admin",
  [UserRoleEnum.ADMIN]: "tenant_admin",
  [UserRoleEnum.DM_APPROVER]: "dm_approver",
  [UserRoleEnum.DM_REQUESTOR]: "dm_requestor",
  [UserRoleEnum.EMPLOYEE]: "employee",
  [UserRoleEnum.DM_WATCHER]: "dm_watcher",
};

/**
 * Reverse mapping: Display name to enum
 */
export const DisplayNameToEnum: Record<string, UserRoleEnum> = {
  "Super Admin": UserRoleEnum.SUPER_ADMIN,
  "Admin": UserRoleEnum.ADMIN,
  "DM Approver": UserRoleEnum.DM_APPROVER,
  "DM Requestor": UserRoleEnum.DM_REQUESTOR,
  "Employee": UserRoleEnum.EMPLOYEE,
  "DM Watcher": UserRoleEnum.DM_WATCHER,
};

/**
 * Reverse mapping: API name to enum
 */
export const ApiNameToEnum: Record<string, UserRoleEnum> = {
  "super_admin": UserRoleEnum.SUPER_ADMIN,
  "tenant_admin": UserRoleEnum.ADMIN,
  "dm_approver": UserRoleEnum.DM_APPROVER,
  "dm_requestor": UserRoleEnum.DM_REQUESTOR,
  "employee": UserRoleEnum.EMPLOYEE,
  "dm_watcher": UserRoleEnum.DM_WATCHER,
  // Legacy mappings
  "manager": UserRoleEnum.DM_APPROVER,
  "viewer": UserRoleEnum.DM_WATCHER,
};

/**
 * Check if a role has higher or equal privilege than another
 */
export function hasRolePrivilege(userRole: UserRoleEnum, requiredRole: UserRoleEnum): boolean {
  return userRole <= requiredRole;
}

/**
 * Get the highest privilege role from an array of roles
 */
export function getHighestRole(roles: UserRoleEnum[]): UserRoleEnum | null {
  if (roles.length === 0) return null;
  return Math.min(...roles) as UserRoleEnum;
}

/**
 * Convert display name to enum
 */
export function displayNameToEnum(displayName: string): UserRoleEnum | null {
  return DisplayNameToEnum[displayName] ?? null;
}

/**
 * Convert API name to enum
 */
export function apiNameToEnum(apiName: string): UserRoleEnum | null {
  return ApiNameToEnum[apiName] ?? null;
}

/**
 * Convert enum to display name
 */
export function enumToDisplayName(role: UserRoleEnum): string {
  return RoleDisplayNames[role] ?? "Unknown";
}

/**
 * Convert enum to API name
 */
export function enumToApiName(role: UserRoleEnum): string {
  return RoleApiNames[role] ?? "employee";
}
