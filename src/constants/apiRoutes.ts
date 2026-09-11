export const apiRoutes = {
  main: {
    app: "/api",
  },

  authentication: {
    root: "authentication",
    addOrg: "/add-org",
    login: "/login",
    addUser: "add-user",
    forgotPassword: "/forgot-password",
    getNewPassword: "/get-new-password",
    resetPassword: "/reset-password",
    validateToken: "/validate-token",
    getOrgAndUserLogo: "get-org-user-logo",
    getOrgShiftTiming: "get-org-shift-time",
  },

  organisation: {
    root: "organisation",
    getOrganisationDetails: "/get-organisation-details",
    editOrganisationDetailsById: "/edit-organisation-details-by-id",
  },

  configurator: {
    root: "configurator",
    cameraManager: "/camera-manager",
    zoneMapping: "/zone-mapping",
    useCaseManager: "/use-case-manager",
    alertConfig: "/alert-config",
  },

  roleInformation: {
    root: "/role-information",
    getList: "get-role-list",
    getUserRoleList: "/get-user-role-list",
    getById: "get-role-information-by-id",
    getUserRoleByUserId: "get-user-role-information-by-user-id",
    addUserRoleByUserId: "add-user-role-by-user-id",
    assignFeaturesToRoleByRoleId: "assign-features-to-role-by-role-id",
    getFeaturesOfRoleByRoleId: "get-features-of-role-by-role-id",
    unmapFeatureFromRoleByRoleId: "unmap-feature-from-role-by-role-id",
    deleteById: "delete-role",
    deleteUserRoleById: "delete-user-role",
    add: "add-role",
    addUserRole: "/add-user-role",
    editById: "/edit-role-by-id",
    editUserRoleById: "/edit-user-role-by-id",
    getFeaturesByOrgId: "get-features-by-org-id",
  },

  userInformation: {
    root: "user-information",
    getList: "get-user-list",
    getById: "get-user-information-by-id",
    editById: "edit-user-information-by-id",
    deleteById: "delete-user",
  },

  surveillanceMonitoringDashboard: {
    root: "surveillanceDashboard",
    getsurveillanceMonitoringDashboardAnalytics:
      "get-surveillance-monitoring-dashboard-analytics",
  },
  WorkforceMonitoringDashboard: {
    root: "workforceMonitoringDashboard",
    getWorkforceMonitoringDashboardAnalyticsKpi:
      "get-workforce-monitoring-dashboard-analytics-kpi",
    getWorkforceMonitoringDashboardAnalyticsgraphs:
      "get-workforce-monitoring-dashboard-analytics-graphs",
  },
  OperationalMonitoringDashboard: {
    root: "operationalMonitoringDashboard",
    getOperationalMonitoringDashboardAnalytics:
      "get-operational-monitoring-dashboard-analytics",
  },
  SafetyMonitoringDashboard: {
    root: "safetyMonitoringDashboard",
    getSafetyMonitoringDashboardData: "get-safety-monitoring-dashboard-data",
  },
  CameraTamperingDashboard: {
    root: "cameraTamperingDashboard",
    getCameraTamperingDashboardAnalyticsKpi:
      "get-camera-tampering-dashboard-analytics-kpi",
  },
  MainDashboard: {
    root: "mainDashboard",
    getMainDashboardAnalyticsKpi: "get-main-dashboard-analytics-kpi",
  },
  ppeKitDetection: {
    root: "ppeKitDetection",
    getPpeKitDetectionAnalyticsKpi: "get-ppe-kit-detection-analytics-kpi",
    getPpeKitDetectionAnalyticsRecentViolations:
      "get-ppe-kit-detection-analytics-recent-violations",
    getPpeKitDetectionAnalyticsZoneViolations:
      "get-ppe-kit-detection-analytics-camera-status-by-zone-violations",
    getPpeKitDetectionAnalyticsDetailedReport:
      "get-ppe-kit-detection-analytics-details-report",
    getPpeKitDetectionAnalyticsDownloadDetailedReport:
      "get-ppe-kit-detection-analytics-download-details-report",
    getPpeKitDetectionAnalyticsDownloadDetailedReportForSingleId:
      "get-ppe-kit-detection-analytics-download-details-report-for-single-id",
    getPpeKitDetectionAnalyticsDetailedReportForSingleId:
      "get-ppe-kit-detection-analytics-details-report-for-single-id",

    getPpeKitDetectionAnalyticsDownloadDetailedCsvReport:
      "get-ppe-kit-detection-analytics-download-details-csv-report",
    getPpeKitDetectionAnalyticsDownloadDetailedPdfReport:
      "get-ppe-kit-detection-analytics-download-details-pdf-report",
  },
  objectDetectionInWalkingBays: {
    root: "objectDetectionInWalkingBays",
    getObjectDetectionInWalkingBaysAnalyticsKpi:
      "get-object-detection-in-walking-bays-analytics-kpi",
    getObjectDetectionInWalkingBaysAnalyticsRecentVoliations:
      "get-object-detection-in-walking-bays-analytics-recent-voliations",
    getObjectDetectionInWalkingBaysAnalyticsCameraStatusByZone:
      "get-object-detection-in-walking-bays-analytics-camera-status-by-zone",
    getObjectDetectionInWalkingBaysAnalyticsDetailedReport:
      "get-object-detection-in-walking-bays-analytics-details-report",
    getObjectDetectionInWalkingBaysAnalyticsDownloadDetailedReport:
      "get-object-detection-in-walking-bays-analytics-download-details-report",
    getObjectDetectionInWalkingBaysAnalyticsDownloadDetailedReportForSingleId:
      "get-object-detection-in-walking-bays-analytics-download-details-report-for-single-id",
    getObjectDetectionInWalkingBaysAnalyticsDetailedReportForSingleId:
      "get-object-detection-in-walking-bays-analytics-details-report-for-single-id",
  },
  fallLaydownDetection: {
    root: "fallLaydownDetection",
    getFallLaydownDetectionAnalyticsKpi:
      "get-fall-laydown-detection-analytics-kpi",
    getFallLaydownDetectionAnalyticsRecentViolations:
      "get-fall-laydown-detection-analytics-recent-violations",
    getFallLaydownDetectionAnalyticsZoneViolations:
      "get-fall-laydown-detection-analytics-zone-violations",
    getFallLaydownDetectionAnalyticsDetailedReport:
      "get-fall-laydown-detection-analytics-details-report",
    getFallLaydownDetectionAnalyticsDownloadDetailedReport:
      "get-fall-laydown-detection-analytics-download-details-report",
    getFallLaydownDetectionAnalyticsDownloadDetailedReportForSingleId:
      "get-fall-laydown--detection-analytics-download-details-report-for-single-id",
    getFallLaydownDetectionAnalyticsDetailedReportForSingleId:
      "get-fall-laydown-detection-analytics-details-report-for-single-id",
    getFallDetectionAnalyticsDownloadDetailedCsvReport: 'get-fall-detection-analytics-download-details-csv-report'

  },
  fireSmokeDetection: {
    root: "fireSmokeDetection",
    // getFireSmokeDetectionAnalyticsKpi: "get-fireSmoke-detection-analytics-kpi",
    // getFireSmokeDetectionAnalyticsRecentViolations:
    //   "get-fireSmoke-detection-analytics-recent-violations",
    // getFireSmokeDetectionAnalyticsZoneViolations:
    //   "get-fireSmoke-detection-analytics-zone-violations",
        getFireSmokeDetectionAnalyticsData: 'get-fireSmoke-detection-analytics-data',
  
    getFireSmokeDetectionAnalyticsDetailedReport:
      "get-fireSmoke-detection-analytics-details-report",
    getFireSmokeDetectionAnalyticsDownloadDetailedReport:
      "get-fireSmoke-detection-analytics-download-details-report",
    getFireSmokeDetectionAnalyticsDownloadDetailedReportForSingleId:
      "get-fireSmoke-detection-analytics-download-details-report-for-single-id",
    getFireSmokeDetectionAnalyticsDetailedReportForSingleId:
      "get-fireSmoke-detection-analytics-details-report-for-single-id",

    getFireSmokeDetectionAnalyticsDownloadDetailedCsvReport: 'get-fireSmoke-detection-analytics-download-details-csv-report',

  },
 forkliftVehicleInWalkways: {
    root: 'forkliftVehicleInWalkways',
    getForkliftVehicleInWalkwaysAnalyticsData: 'get-forklift-vehicle-in-walkways-analytics-kpi-recent-zone-violations',
    getForkliftVehicleInWalkwaysAnalyticsDetailedReport: 'get-forklift-vehicle-in-walkways-analytics-details-report',
    getForkliftVehicleInWalkwaysAnalyticsDownloadDetailedPdfReport: 'get-forklift-vehicle-in-walkways-analytics-download-details-pdf-report',
    getForkliftVehicleInWalkwaysAnalyticsDownloadDetailedCSVReport: 'get-forklift-vehicle-in-walkways-analytics-download-details-csv-report',
    getForkliftVehicleInWalkwaysAnalyticsDownloadDetailedReportForSingleId: 'get-forklift-vehicle-in-walkways-analytics-download-details-report-for-single-id',
  },
  emergencyExitBlockageDetection: {
    root: 'emergencyExitBlockageDetection',
    getEmergencyExitBlockageDetectionAnalyticsData: 'get-emergency-exit-blockage-detection-analytics-kpi-zone-recent-violations',
    getEmergencyExitBlockageDetectionAnalyticsDetailedReport: 'get-emergency-exit-blockage-detection-analytics-details-report',
    getEmergencyExitBlockageDetectionAnalyticsDownloadDetailedPdfReport: 'get-emergency-exit-blockage-detection-analytics-download-details-pdf-report',
    getEmergencyExitBlockageDetectionAnalyticsDownloadDetailedCSVReport: 'get-emergency-exit-blockage-detection-analytics-download-details-csv-report',
    getEmergencyExitBlockageDetectionAnalyticsDownloadDetailedReportForSingleId: 'get-emergency-exit-blockage-detection-analytics-download-details-report-for-single-id',
  },
   cameraTamperingDetection: {
    root: 'cameraTamperingDetection',
    getCameraTamperingDetectionAnalyticsData: 'get-camera-tampering-detection-analytics-kpi-zone-recent-violations',
    getCameraTamperingDetectionAnalyticsDetailedReport: 'get-camera-tampering-detection-analytics-details-report',
    getCameraTamperingDetectionAnalyticsDownloadDetailedPdfReport: 'get-camera-tampering-detection-analytics-download-details-pdf-report',
    getCameraTamperingDetectionAnalyticsDownloadDetailedCSVReport: 'get-camera-tampering-detection-analytics-download-details-csv-report',
    getCameraTamperingDetectionAnalyticsDownloadDetailedReportForSingleId: 'get-camera-tampering-detection-analytics-download-details-report-for-single-id'
  },
    monitoringCanteenUsageAndTimings: {
    root:'monitoringCanteenUsageAndTimings',
    getMonitoringCanteenUsageAndTimingsAnalyticsData: 'get-monitoring-canteen-usage-and-timings-analytics-data',
    getMonitoringCanteenUsageAndTimingsAnalyticsDetailedReport: 'get-monitoring-canteen-usage-and-timings-analytics-detailed-report',
    getMonitoringCanteenUsageAndTimingsAnalyticsDownloadDetailedPdfReport: 'get-monitoring-canteen-usage-and-timings-analytics-download-details-pdf-report',
    getMonitoringCanteenUsageAndTimingsAnalyticsDownloadDetailedCSVReport: 'get-monitoring-canteen-usage-and-timings-analytics-download-details-csv-report',
    getMonitoringCanteenUsageAndTimingsAnalyticsDownloadDetailedReportForSingleId: 'get-monitoring-canteen-usage-and-timings-analytics-download-details-report-for-single-id',
  },
  crowdGatheringInHazardousZones: {
    root: "crowdGatheringInHazardousZones",
        getCrowdGatheringInHazardousZonesAnalyticsData: 'get-crowd-gathering-in-hazardous-zones-analytics-kpi-recent-zone-violations',
    getCrowdGatheringInHazardousZonesAnalyticsDetailedReport:
      "get-crowd-gathering-in-hazardous-zones-analytics-details-report",
    getCrowdGatheringInHazardousZonesAnalyticsDownloadDetailedPdfReport:
      "get-crowd-gathering-in-hazardous-zones-analytics-download-details-pdf-report",
    getCrowdGatheringInHazardousZonesAnalyticsDownloadDetailedReportForSingleId:
      "get-crowd-gathering-in-hazardous-zones-analytics-download-details-report-for-single-id",
    getCrowdGatheringInHazardousZonesAnalyticsDownloadDetailedCSVReport:
      "get-crowd-gathering-in-hazardous-zones-analytics-download-details-csv-report",
  },
  intrusionDetectionAtPremisesPerimeter: {
    root: "intrusionDetectionAtPremisesPerimeter",
    getIntrusionDetectionAnalyticsKpi: "get-intrusion-detection-analytics-kpi",
    getIntrusionDetectionAnalyticsRecentViolations:
      "get-intrusion-detection-analytics-recent-violations",
    getIntrusionDetectionAnalyticsZoneViolations:
      "get-intrusion-detection-analytics-zone-violations",
    getIntrusionDetectionAnalyticsDetailedReport:
      "get-intrusion-detection-analytics-details-report",
    getIntrusionDetectionAnalyticsDownloadDetailedPdfReport:
      "get-intrusion-detection-analytics-download-details-pdf-report",
    getIntrusionDetectionAnalyticsDownloadDetailedCsvReport:
      "get-intrusion-detection-analytics-download-details-csv-report",
    getIntrusionDetectionAnalyticsDownloadDetailedReportForSingleId:
      "get-intrusion-detection-analytics-download-details-report-for-single-id",
    getIntrusionDetectionAnalyticsDetailedReportForSingleId:
      "get-intrusion-detection-analytics-details-report-for-single-id",
  },
  cameraTamperingOrOfflineDetection: {
    root: "cameraTamperingOrOfflineDetection",
    getIntrusionDetectionAtPremisesPerimeterAnalyticsKpi:
      "get-crowd-gathering-in-hazardous-zones-analytics-kpi",
    getIntrusionDetectionAtPremisesPerimeterAnalyticsRecentVoliations:
      "get-crowd-gathering-in-hazardous-zones-analytics-recent-voliations",
    getIntrusionDetectionAtPremisesPerimeterAnalyticsCameraStatusByZone:
      "get-crowd-gathering-in-hazardous-zones-analytics-camera-status-by-zone",
    getIntrusionDetectionAtPremisesPerimeterAnalyticsDetailedReport:
      "get-crowd-gathering-in-hazardous-zones-analytics-details-report",
    getIntrusionDetectionAtPremisesPerimeterAnalyticsDownloadDetailedReport:
      "get-crowd-gathering-in-hazardous-zones-analytics-download-details-report",
    getIntrusionDetectionAtPremisesPerimeterAnalyticsDownloadDetailedReportForSingleId:
      "get-crowd-gathering-in-hazardous-zones-analytics-download-details-report-for-single-id",
    getIntrusionDetectionAtPremisesPerimeterAnalyticsDetailedReportForSingleId:
      "get-crowd-gathering-in-hazardous-zones-analytics-details-report-for-single-id",
  },

  MovementDuringShutdownHours: {
    root: "movementDuringShutdownHours",
    getMovementDuringShutdownHoursAnalyticsKpi:
      "get-movement-during-shutdown-hours-analytics-kpi",
    getMovementDuringShutdownHoursAnalyticsRecentViolations:
      "get-movement-during-shutdown-hours-analytics-recent-violations",
    getMovementDuringShutdownHoursAnalyticsZoneViolations:
      "get-movement-during-shutdown-hours-analytics-zone-violations",
    getMovementDuringShutdownHoursAnalyticsDetailedReport:
      "get-movement-during-shutdown-hours-analytics-details-report",
    getMovementDuringShutdownHoursAnalyticsDownloadDetailedPdfReport:
      "get-movement-during-shutdown-hours-analytics-download-details-pdf-report",
    getMovementDuringShutdownHoursAnalyticsDownloadDetailedCsvReport:
      "get-movement-during-shutdown-hours-analytics-download-details-csv-report",
    getMovementDuringShutdownHoursAnalyticsDownloadDetailedReportForSingleId:
      "get-movement-during-shutdown-hours-analytics-download-details-report-for-single-id",
    getMovementDuringShutdownHoursAnalyticsDetailedReportForSingleId:
      "get-movement-during-shutdown-hours-analytics-details-report-for-single-id",
  },

  employeeIdleTimeMonitoring: {
    root: "employeeIdleTimeMonitoring",
    getEmployeeIdleTimeMonitoringAnalyticsKpi:
      "get-employee-idle-time-monitoring-analytics-kpi",
    getEmployeeIdleTimeMonitoringAnalyticsRecentViolations:
      "get-employee-idle-time-monitoring-analytics-recent-violations",
    getEmployeeIdleTimeMonitoringAnalyticsZoneViolations:
      "get-employee-idle-time-monitoring-analytics-zone-violations",
    getEmployeeIdleTimeMonitoringAnalyticsDetailedReport:
      "get-employee-idle-time-monitoring-analytics-detailed-report",
    getEmployeeIdleTimeMonitoringAnalyticsDownloadDetailedPdfReport:
      "get-employee-idle-time-monitoring-analytics-download-details-pdf-report",
    getEmployeeIdleTimeMonitoringAnalyticsDownloadDetailedCsvReport:
      "get-employee-idle-time-monitoring-analytics-download-details-csv-report",
    getEmployeeIdleTimeMonitoringAnalyticsDownloadDetailedReportForSingleId:
      "get-employee-idle-time-monitoring-analytics-download-details-report-for-single-id",
  },
  employeePresenceDetectionInCriticalAreas: {
    root: "employeePresenceDetectionInCriticalAreas",
      getEmployeePresenceDetectionInCriticalAreasAnalyticsKpiRecentZoneViolation: 'get-employee-presence-detection-in-critical-areas-analytics-kpi-recent-zone-violations',
    getEmployeePresenceDetectionInCriticalAreasAnalyticsDetailedReport:
      "get-employee-presence-detection-in-critical-areas-analytics-details-report",
    getEmployeePresenceDetectionInCriticalAreasAnalyticsDownloadDetailedpdfReport:
      "get-employee-presence-detection-in-critical-areas-analytics-download-details-pdf-report",
    getEmployeePresenceDetectionInCriticalAreasAnalyticsDownloadDetailedReportForSingleId:
      "get-employee-presence-detection-in-critical-areas-analytics-download-details-report-for-single-id",
    getEmployeePresenceDetectionInCriticalAreasAnalyticsDownloadDetailedcsvReport:
      "get-employee-presence-detection-in-critical-areas-analytics-download-details-csv-report",
  },
     employeePresenceDetectionInRestrictedAreas: {
    root: "employeePresenceDetectionInRestrictedAreas",
      getEmployeePresenceDetectionInRestrictedAreasAnalyticsKpiRecentZoneViolation: 'get-employee-presence-detection-in-restricted-areas-analytics-kpi-recent-zone-violations',
    getEmployeePresenceDetectionInRestrictedAreasAnalyticsDetailedReport:
      "get-employee-presence-detection-in-restricted-areas-analytics-details-report",
    getEmployeePresenceDetectionInRestrictedAreasAnalyticsDownloadDetailedpdfReport:
      "get-employee-presence-detection-in-restricted-areas-analytics-download-details-pdf-report",
    getEmployeePresenceDetectionInRestrictedAreasAnalyticsDownloadDetailedReportForSingleId:
      "get-employee-presence-detection-in-restricted-areas-analytics-download-details-report-for-single-id",
    getEmployeePresenceDetectionInRestrictedAreasAnalyticsDownloadDetailedcsvReport:
      "get-employee-presence-detection-in-restricted-areas-analytics-download-details-csv-report",
  },
  mobilePhoneUsageInRestrictedAreas: {
    root: "mobilePhoneUsageInRestrictedAreas",
    getMobilePhoneUsageInRestrictedAreasAnalyticsKpi:
      "get-mobile-phone-usage-in-restricted-areas-analytics-kpi",
    getMobilePhoneUsageInRestrictedAreasAnalyticsRecentVoliations:
      "get-mobile-phone-usage-in-restricted-areas-analytics-recent-voliations",
    getMobilePhoneUsageInRestrictedAreasAnalyticsCameraStatusByZone:
      "get-mobile-phone-usage-in-restricted-areas-analytics-camera-status-by-zone",
    getMobilePhoneUsageInRestrictedAreasAnalyticsDetailedReport:
      "get-mobile-phone-usage-in-restricted-areas-analytics-details-report",
    getMobilePhoneUsageInRestrictedAreasAnalyticsDownloadDetailedReport:
      "get-mobile-phone-usage-in-restricted-areas-analytics-download-details-report",
    getMobilePhoneUsageInRestrictedAreasAnalyticsDownloadDetailedReportForSingleId:
      "get-mobile-phone-usage-in-restricted-areas-analytics-download-details-report-for-single-id",
    getMobilePhoneUsageInRestrictedAreasAnalyticsDetailedReportForSingleId:
      "get-mobile-phone-usage-in-restricted-areas-time-monitoring-analytics-details-report-for-single-id",
  },
  peopleCountInFactoryPremises: {
    root: 'peopleCountInFactoryPremises',
    getPeopleCountInFactoryPremisesKpiZoneRecentViolation: 'get-people-count-in-factory-premises-kpi-zone-recent-violation',
    getPeopleCountInFactoryPremisesDetailedReport: 'get-people-count-in-factory-premises-details-report',
    getPeopleCountInFactoryPremisesDownloadDetailedPdfReport:
      'get-people-count-in-factory-download-details-pdf-report',
          getPeopleCountInFactoryPremisesDownloadDetailedcsvReport:
      "get-employee-presence-detection-in-critical-areas-analytics-download-details-csv-report",

    getPeopleCountInFactoryPremisesDownloadDetailedReportForSingleId:
      'get-people-count-in-factory-download-details-report-for-single-id',
  },
  sleepingOrAbsenceOfSecurityPersonnel: {
    root: "sleepingOrAbsenceOfSecurityPersonnel",
    getSleepingOrAbsenceOfSecurityPersonnelAnalyticsKpi:
      "get-sleeping-or-absence-of-security-personnel-analytics-kpi",
    getSleepingOrAbsenceOfSecurityPersonnelAnalyticsRecentVoliations:
      "get-sleeping-or-absence-of-security-personnel-analytics-recent-voliations",
    getSleepingOrAbsenceOfSecurityPersonnelAnalyticsCameraStatusByZone:
      "get-sleeping-or-absence-of-security-personnel-analytics-camera-status-by-zone",
    getSleepingOrAbsenceOfSecurityPersonnelAnalyticsDetailedReport:
      "get-sleeping-or-absence-of-security-personnel-analytics-details-report",
    getSleepingOrAbsenceOfSecurityPersonnelAnalyticsDownloadDetailedReport:
      "get-sleeping-or-absence-of-security-personnel-analytics-download-details-report",
    getSleepingOrAbsenceOfSecurityPersonnelAnalyticsDownloadDetailedReportForSingleId:
      "get-sleeping-or-absence-of-security-personnel-analytics-download-details-report-for-single-id",
    getSleepingOrAbsenceOfSecurityPersonnelAnalyticsDetailedReportForSingleId:
      "get-sleeping-or-absence-of-security-personnel-analytics-details-report-for-single-id",
  },

  VehicleCountAndANPRAtEntryExitGates: {
    root: "sleepingOrAbsenceOfSecurityPersonnel",
    getSleepingOrAbsenceOfSecurityPersonnelAnalyticsKpi:
      "get-sleeping-or-absence-of-security-personnel-analytics-kpi",
    getSleepingOrAbsenceOfSecurityPersonnelAnalyticsRecentVoliations:
      "get-sleeping-or-absence-of-security-personnel-analytics-recent-voliations",
    getSleepingOrAbsenceOfSecurityPersonnelAnalyticsCameraStatusByZone:
      "get-sleeping-or-absence-of-security-personnel-analytics-camera-status-by-zone",
    getSleepingOrAbsenceOfSecurityPersonnelAnalyticsDetailedReport:
      "get-sleeping-or-absence-of-security-personnel-analytics-details-report",
    getSleepingOrAbsenceOfSecurityPersonnelAnalyticsDownloadDetailedReport:
      "get-sleeping-or-absence-of-security-personnel-analytics-download-details-report",
    getSleepingOrAbsenceOfSecurityPersonnelAnalyticsDownloadDetailedReportForSingleId:
      "get-sleeping-or-absence-of-security-personnel-analytics-download-details-report-for-single-id",
    getSleepingOrAbsenceOfSecurityPersonnelAnalyticsDetailedReportForSingleId:
      "get-sleeping-or-absence-of-security-personnel-analytics-details-report-for-single-id",
  },
  trackingVehicleUnloadingLoadingTime: {
    root: "trackingVehicleUnloadingLoadingTime",
    getTrackingVehicleUnloadingLoadingTimeAnalyticsKpi:
      "get-tracking-vehicle-unloading-loading-time-analytics-kpi",
    getTrackingVehicleUnloadingLoadingTimeAnalyticsRecentVoliations:
      "get-tracking-vehicle-unloading-loading-time-analytics-recent-voliations",
    getTrackingVehicleUnloadingLoadingTimeAnalyticsCameraStatusByZone:
      "get-tracking-vehicle-unloading-loading-time-analytics-camera-status-by-zone",
    getTrackingVehicleUnloadingLoadingTimeAnalyticsDetailedReport:
      "get-tracking-vehicle-unloading-loading-time-analytics-details-report",
    getTrackingVehicleUnloadingLoadingTimeAnalyticsDownloadDetailedReport:
      "get-tracking-vehicle-unloading-loading-time-analytics-download-details-report",
    getTrackingVehicleUnloadingLoadingTimeAnalyticsDownloadDetailedReportForSingleId:
      "get-tracking-vehicle-unloading-loading-time-analytics-download-details-report-for-single-id",
    getTrackingVehicleUnloadingLoadingTimeAnalyticsDetailedReportForSingleId:
      "get-tracking-vehicle-unloading-loading-time-analytics-details-report-for-single-id",
  },
  unauthorizedParkingOrEquipmentBlockingAisles: {
    root: "unauthorizedParkingOrEquipmentBlockingAisles",
    getUnauthorizedParkingOrEquipmentBlockingAislesAnalyticsKpi:
      "get-unauthorized-parking-or-equipment-blocking-aisles-analytics-kpi",
    getUnauthorizedParkingOrEquipmentBlockingAislesAnalyticsRecentVoliations:
      "get-unauthorized-parking-or-equipment-blocking-aisles-analytics-recent-voliations",
    getUnauthorizedParkingOrEquipmentBlockingAislesAnalyticsCameraStatusByZone:
      "get-unauthorized-parking-or-equipment-blocking-aisles-analytics-camera-status-by-zone",
    getUnauthorizedParkingOrEquipmentBlockingAislesAnalyticsDetailedReport:
      "get-unauthorized-parking-or-equipment-blocking-aisles-analytics-details-report",
    getUnauthorizedParkingOrEquipmentBlockingAislesAnalyticsDownloadDetailedReport:
      "get-unauthorized-parking-or-equipment-blocking-aisles-analytics-download-details-report",
    getUnauthorizedParkingOrEquipmentBlockingAislesAnalyticsDownloadDetailedReportForSingleId:
      "get-unauthorized-parking-or-equipment-blocking-aisles-analytics-download-details-report-for-single-id",
    getUnauthorizedParkingOrEquipmentBlockingAislesAnalyticsDetailedReportForSingleId:
      "get-unauthorized-parking-or-equipment-blocking-aisles-analytics-details-report-for-single-id",
  },

  unauthorizedAccessInRestrictedAreas: {
    root :"unauthorizedAccessInRestrictedAreas",
    getUnauthorizedAccessInRestrictedAreasAnalyticsData:
      "get-unauthorized-access-in-restricted-areas-analytics-data",
    getUnauthorizedAccessInRestrictedAreasAnalyticsRecentViolations:
      "get-unauthorized-access-in-restricted-areas-analytics-recent-violations",
    getUnauthorizedAccessInRestrictedAreasAnalyticsCameraStatusByZone:
      "get-unauthorized-access-in-restricted-areas-analytics-camera-status-by-zone",
    getUnauthorizedAccessInRestrictedAreasAnalyticsDetailedReport:
      "get-unauthorized-access-in-restricted-areas-analytics-details-report",
    getUnauthorizedAccessInRestrictedAreasAnalyticsDownloadPdfDetailedReport:
      "get-unauthorized-access-in-restricted-areas-analytics-download-pdf-details-report",
          getUnauthorizedAccessInRestrictedAreasAnalyticsDownloadCSVDetailedReport:
      "get-unauthorized-access-in-restricted-areas-analytics-download-csv-details-report",

    getUnauthorizedAccessInRestrictedAreasAnalyticsDownloadDetailedReportForSingleId:
      "get-unauthorized-access-in-restricted-areas-analytics-download-details-report-for-single-id",
    getUnauthorizedAccessInRestrictedAreasAnalyticsDetailedReportForSingleId:
      "get-unauthorized-access-in-restricted-areas-analytics-details-report-for-single-id",
  },
  faceRecognitionForEntryExitLogging: {
    getFaceRecognitionForEntryExitLoggingAnalyticsKpi:
      "get-face-recognition-for-entry-exit-logging-analytics-kpi",
    getFaceRecognitionForEntryExitLoggingAnalyticsRecentViolations:
      "get-face-recognition-for-entry-exit-logging-analytics-recent-violations",
    getFaceRecognitionForEntryExitLoggingAnalyticsCameraStatusByZone:
      "get-face-recognition-for-entry-exit-logging-analytics-camera-status-by-zone",
    getFaceRecognitionForEntryExitLoggingAnalyticsDetailedReport:
      "get-face-recognition-for-entry-exit-logging-analytics-details-report",
    getFaceRecognitionForEntryExitLoggingAnalyticsDownloadDetailedReport:
      "get-face-recognition-for-entry-exit-logging-analytics-download-details-report",
    getFaceRecognitionForEntryExitLoggingAnalyticsDownloadDetailedReportForSingleId:
      "get-face-recognition-for-entry-exit-logging-analytics-download-details-report-for-single-id",
    getFaceRecognitionForEntryExitLoggingAnalyticsDetailedReportForSingleId:
      "get-face-recognition-for-entry-exit-logging-analytics-details-report-for-single-id",
  },

  employeeIdleTimeMonitoringWithFaceDetection: {
    getEmployeeIdleTimeMonitoringWithFaceDetectionAnalyticsKpi:
      "get-employee-idle-time-monitoring-with-face-detection-analytics-kpi",
    getEmployeeIdleTimeMonitoringWithFaceDetectionAnalyticsRecentViolations:
      "get-employee-idle-time-monitoring-with-face-detection-analytics-recent-violations",
    getEmployeeIdleTimeMonitoringWithFaceDetectionAnalyticsCameraStatusByZone:
      "get-employee-idle-time-monitoring-with-face-detection-analytics-camera-status-by-zone",
    getEmployeeIdleTimeMonitoringWithFaceDetectionAnalyticsDetailedReport:
      "get-employee-idle-time-monitoring-with-face-detection-analytics-details-report",
    getEmployeeIdleTimeMonitoringWithFaceDetectionAnalyticsDownloadDetailedReport:
      "get-employee-idle-time-monitoring-with-face-detection-analytics-download-details-report",
    getEmployeeIdleTimeMonitoringWithFaceDetectionAnalyticsDownloadDetailedReportForSingleId:
      "get-employee-idle-time-monitoring-with-face-detection-analytics-download-details-report-for-single-id",
    getEmployeeIdleTimeMonitoringWithFaceDetectionAnalyticsDetailedReportForSingleId:
      "get-employee-idle-time-monitoring-with-face-detection-analytics-details-report-for-single-id",
  },
  alerts: {
    root: "alerts",
    getAllAlerts: "get-all-alerts", // kafka queue for showing the alerts
  },
  zoneOccupancyMonitoring: {
    root: "zoneOccupancyMonitoring",
    getZoneOccupancyMonitoringAnalyticsData: "get-zone-occupancy-monitoring-analytics-kpi-recent-zone-violations",
    getZoneOccupancyMonitoringAnalyticsDetailedReport: "get-zone-occupancy-monitoring-analytics-details-report",
    getZoneOccupancyMonitoringAnalyticsDownloadDetailedPdfReport: "get-zone-occupancy-monitoring-analytics-download-details-pdf-report",
    getZoneOccupancyMonitoringAnalyticsDownloadDetailedCSVReport: "get-zone-occupancy-monitoring-analytics-download-details-csv-report",
    getZoneOccupancyMonitoringAnalyticsDownloadDetailedReportForSingleId: "get-zone-occupancy-monitoring-analytics-download-details-report-for-single-id",
  },
};
