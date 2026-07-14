"use client";

import React, { useMemo, useState } from "react";
import { Box, Container, Typography, Alert, Skeleton } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import {
  ScoutUser,
  UserAlertConfig,
  UseCaseCategory,
  UseCaseSummary,
} from "@/app/types/alertConfig";
import { showToast } from "@/app/store/slices/toasterSlice";
import { getErrorMessage } from "@/utils/getErrorMessage";
import {
  AlertConfigUsersTable,
  ConfigureUserDialog,
} from "@/app/components/organisms/configurator/alert-configuration";
import { useGetUserOverviewQuery } from "../../(userManagement)/userOverview/UserOverviewApi";
import { useGetUsecasesQuery } from "../useCaseManager/UseCaseManagerAPI";
import {
  useGetUserSubscriptionsQuery,
  useSaveUserSubscriptionsMutation,
  useGetUserStatusesQuery,
  useSetUserStatusMutation,
} from "./AlertConfigurationAPI";

import {
  mockUsers,
  mockCategories,
  mockUseCases,
  mockUserAlertConfigs,
} from "@/app/components/organisms/configurator/alert-configuration/alertConfigMockData";


const USE_MOCK =
  process.env.NEXT_PUBLIC_USE_MOCK === "true";

/**
 * Alert Configuration is configured per user (not per use case) — an
 * administrator picks a Scout user, subscribes them to one or more AI use
 * cases, and chooses which channels and notification mode apply per use case.
 *
 * Data sources:
 * - Users: `users` table of the tenant's scout_settings schema, via the
 *   existing user-information endpoint (includes roleName enrichment).
 * - Use cases: `settings_usecase` table via the Use-Case Manager endpoint —
 *   only the use cases licensed for this organization.
 * - Subscriptions + per-user status: the configurator/alert-config endpoints
 *   backed by `alert_subscription` and `alert_user_status`.
 */

export const USE_CASE_CATEGORIES: UseCaseCategory[] = [
  { id: "cat-safety", name: "Safety & Compliance" },
  { id: "cat-security", name: "Surveillance Monitoring" },
  { id: "cat-workforce", name: "Workforce Monitoring" },
  { id: "cat-operational", name: "Operational Insight" },
];

// The full Scout AI catalog. Use cases missing from the organization's
// settings_usecase table are still shown in the dialog, but locked, so
// customers can see which additional capabilities Scout offers.
const SCOUT_USE_CASE_CATALOG: { name: string; categoryId: string }[] = [
  // Safety & Compliance
  { name: "PPE Compliance Detection", categoryId: "cat-safety" },
  { name: "Fire & Smoke Detection", categoryId: "cat-safety" },
  { name: "Person Fall Detection", categoryId: "cat-safety" },
  { name: "Vehicle in Pedestrian Walkway Detection", categoryId: "cat-safety" },
  { name: "Emergency Exit Obstruction Detection", categoryId: "cat-safety" },
  { name: "Crowd Detection in Hazardous Areas", categoryId: "cat-safety" },

  // Surveillance Monitoring
  { name: "Perimeter Intrusion Detection", categoryId: "cat-security" },
  { name: "Shutdown Period Activity Detection", categoryId: "cat-security" },
  { name: "Restricted Area Access Detection", categoryId: "cat-security" },

  // Workforce Monitoring
  { name: "Employee Idle Time Monitoring", categoryId: "cat-workforce" },
  { name: "Critical Area Occupancy Monitoring", categoryId: "cat-workforce" },
  { name: "Restricted Area Occupancy Monitoring", categoryId: "cat-workforce" },
  { name: "Mobile Phone Usage Detection", categoryId: "cat-workforce" },
  { name: "Security Guard Alertness Monitoring", categoryId: "cat-workforce" },

  // Operational Insight
  { name: "Vehicle Counting & ANPR", categoryId: "cat-operational" },
  { name: "Canteen Occupancy Monitoring", categoryId: "cat-operational" },
  { name: "Loading & Unloading Activity Monitoring", categoryId: "cat-operational" },
  { name: "Unauthorized Parking Detection", categoryId: "cat-operational" },
];

// Tolerant name matching between the catalog and settings_usecase rows —
// "Fire & Smoke Detection" and "Fire and Smoke Detection" should be the
// same use case.
const normalizeName = (name: string): string =>
  name
    .toLowerCase()
    .replaceAll("&", "and")
    .replaceAll(/[^a-z0-9 ]/g, " ")
    .replaceAll(/\s+/g, " ")
    .trim();

const CATEGORY_KEYWORDS: { categoryId: string; keywords: string[] }[] = [
  {
    categoryId: "cat-safety",
    keywords: ["ppe", "helmet", "fire", "smoke", "fall", "walkway", "exit", "crowd"],
  },
  {
    categoryId: "cat-security",
    keywords: ["intrusion", "shutdown", "access", "perimeter", "tamper"],
  },
  {
    categoryId: "cat-workforce",
    keywords: ["idle", "occupancy", "mobile", "guard", "employee", "face"],
  },
  {
    categoryId: "cat-operational",
    keywords: ["count", "anpr", "canteen", "loading", "unloading", "parking", "vehicle"],
  },
];

// Fallback for org use cases whose name doesn't match the catalog.
const deriveCategoryId = (usecaseName: string): string => {
  const name = usecaseName.trim().toLowerCase();
  for (const { categoryId, keywords } of CATEGORY_KEYWORDS) {
    if (keywords.some((keyword) => name.includes(keyword))) {
      return categoryId;
    }
  }
  return "cat-operational";
};

const AlertConfiguration: React.FC = () => {
  const dispatch = useDispatch();
  const [selectedUser, setSelectedUser] = useState<ScoutUser | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { user: authUser } = useSelector((state: RootState) => state.auth);
  const tenantId = authUser?.org_id;
  const loggedInUserId = authUser?.userId;

  const {
    data: usersResponse,
    isLoading: isLoadingUsers,
    error: usersError,
  } = useGetUserOverviewQuery(
    {
      tenantId: tenantId!,
      userId: loggedInUserId!,
    },
    {
      skip:
        USE_MOCK ||
        !tenantId ||
        !loggedInUserId,
    }
  );

  const { data: usecasesResponse, isLoading: isLoadingUsecases } = useGetUsecasesQuery(undefined, {
    skip: USE_MOCK,
  });
  const { data: subscriptionsResponse, isLoading: isLoadingSubscriptions } = useGetUserSubscriptionsQuery(undefined, {
    skip: USE_MOCK,
  });
  const { data: statusesResponse } = useGetUserStatusesQuery(undefined, {
    skip: USE_MOCK,
  });

  const [saveUserSubscriptions, { isLoading: isSaving }] = useSaveUserSubscriptionsMutation();
  const [setUserStatus] = useSetUserStatusMutation();

  const statusByUserId = useMemo(() => {
    const map: Record<string, boolean> = {};
    (statusesResponse ?? []).forEach((status) => {
      map[status.userId] = status.enabled;
    });
    return map;
  }, [statusesResponse]);

  const users: ScoutUser[] = useMemo(() => {
    if (USE_MOCK) {
    return mockUsers;
  }
    const backendUsers = usersResponse?.data?.data ?? [];
    return backendUsers.map((u) => ({
      id: u.userId,
      firstName: u.first_name ?? "",
      lastName: u.last_name ?? "",
      email: u.email ?? "",
      phone: u.phoneNumber ?? "",
      roleName: u.roleName ?? "—",
      // No status row yet means the user has never been disabled.
      enabled: statusByUserId[u.userId] ?? true,
    }));
  }, [usersResponse, statusByUserId]);

  const useCases: UseCaseSummary[] = useMemo(() => {

    if (USE_MOCK) {
        return mockUseCases;
    }

    const orgUseCases = Array.isArray(usecasesResponse) ? usecasesResponse : [];

    // Org's licensed use cases — selectable. Matched against the catalog by
    // normalized name to pick up the canonical category.
    const matchedCatalogNames = new Set<string>();
    const available: UseCaseSummary[] = orgUseCases.map((uc) => {
      const catalogEntry = SCOUT_USE_CASE_CATALOG.find(
        (entry) => normalizeName(entry.name) === normalizeName(uc.usecaseName)
      );
      if (catalogEntry) matchedCatalogNames.add(catalogEntry.name);
      return {
        id: uc.id,
        name: uc.usecaseName,
        categoryId: catalogEntry?.categoryId ?? deriveCategoryId(uc.usecaseName),
        available: true,
      };
    });

    // Remaining catalog entries — not in the org's subscription, shown locked.
    const unavailable: UseCaseSummary[] = SCOUT_USE_CASE_CATALOG.filter(
      (entry) => !matchedCatalogNames.has(entry.name)
    ).map((entry) => ({
      id: `locked-${normalizeName(entry.name).replaceAll(" ", "-")}`,
      name: entry.name,
      categoryId: entry.categoryId,
      available: false,
    }));

    return [...available, ...unavailable];
  }, [usecasesResponse]);

  // const categories = useMemo(
  //   () => USE_CASE_CATEGORIES.filter((cat) => useCases.some((uc) => uc.categoryId === cat.id)),
  //   [useCases]
  // );

  const categories = useMemo(() => {

    if (USE_MOCK) {
        return mockCategories;
    }

    return USE_CASE_CATEGORIES.filter(cat =>
        useCases.some(uc => uc.categoryId === cat.id)
    );

}, [useCases]);

  const configsByUserId = useMemo(() => {
    if (USE_MOCK) {

      return mockUserAlertConfigs.reduce<
        Record<string, UserAlertConfig>
      >((acc, config) => {

        acc[config.userId] = config;

        return acc;

      }, {});
    }
    return (subscriptionsResponse ?? []).reduce<Record<string, UserAlertConfig>>((acc, config) => {
      acc[config.userId] = config;
      return acc;
    }, {});
  }, [subscriptionsResponse]);

  const handleConfigure = (user: ScoutUser) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
  };

  const handleSave = async (config: UserAlertConfig) => {
    try {

      if (USE_MOCK) {

        dispatch(
          showToast({
            id: crypto.randomUUID(),
            message: "Mock configuration saved successfully.",
            severity: "success",
          })
        );

        handleCloseDialog();

        return;
      }
      await saveUserSubscriptions({
        userId: config.userId,
        subscriptions: config.subscriptions,
      }).unwrap();

      dispatch(
        showToast({
          id: crypto.randomUUID(),
          message: `Alert configuration saved for ${selectedUser?.firstName} ${selectedUser?.lastName}.`,
          severity: "success",
        })
      );
      handleCloseDialog();
    } catch (err) {
      dispatch(
        showToast({
          id: crypto.randomUUID(),
          message: getErrorMessage(err, "Failed to save alert configuration."),
          severity: "error",
        })
      );
    }
  };

  const handleToggleEnabled = async (user: ScoutUser) => {
    const nextEnabled = !user.enabled;
    try {
      if (USE_MOCK) {

        dispatch(
          showToast({
            id: crypto.randomUUID(),
            message: "Mock status updated.",
            severity: "success",
          })
        );

        return;
      }

      await setUserStatus({ userId: user.id, enabled: nextEnabled }).unwrap();

      dispatch(
        showToast({
          id: crypto.randomUUID(),
          message: nextEnabled
            ? `${user.firstName} ${user.lastName} will now receive alert notifications.`
            : `${user.firstName} ${user.lastName} has been disabled — they will not receive any alert notifications.`,
          severity: nextEnabled ? "success" : "info",
        })
      );
    } catch (err) {
      dispatch(
        showToast({
          id: crypto.randomUUID(),
          message: getErrorMessage(err, "Failed to update user status."),
          severity: "error",
        })
      );
    }
  };

  const isLoading = USE_MOCK
    ? false
    : isLoadingUsers ||
    isLoadingUsecases ||
    isLoadingSubscriptions;

  const renderContent = () => {
    if (isLoading) {
      return (
        <Box>
          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rectangular" height={100} sx={{ flex: 1, borderRadius: 2 }} />
            ))}
          </Box>
          <Skeleton variant="rectangular" height={56} sx={{ mb: 2.5, borderRadius: 1 }} />
          <Skeleton variant="rectangular" height={420} sx={{ borderRadius: 2 }} />
        </Box>
      );
    }

    if (!USE_MOCK && usersError) {
      return (
        <Alert severity="error">
          {getErrorMessage(usersError, "Failed to load users. Please try again later.")}
        </Alert>
      );
    }

    if (users.length === 0) {
      return (
        <Alert severity="info">
          No users found for your organization. Add users in User Management first.
        </Alert>
      );
    }

    return (
      <AlertConfigUsersTable
        users={users}
        configsByUserId={configsByUserId}
        onConfigure={handleConfigure}
        onToggleEnabled={handleToggleEnabled}
      />
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={700}>
          Alert Configuration
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure which AI use case alerts each user receives, and through which
          channels — email, WhatsApp, or SMS.
        </Typography>
      </Box>

      {renderContent()}

      <ConfigureUserDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        user={selectedUser}
        categories={categories}
        useCases={useCases}
        existingConfig={selectedUser ? configsByUserId[selectedUser.id] ?? null : null}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </Container>
  );
};

export default AlertConfiguration;
