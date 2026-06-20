// Terra Forest Mock Data Store
// Shared data for all mock API routes

export interface User {
  id: number;
  name: string;
  email: string;
  roles: { name: string; permissions: string[] }[];
}

export interface Plot {
  id: number;
  plot_code: string;
  area_ha: number;
  forest_type: string;
  status: string;
  latitude: number;
  longitude: number;
  province_id: number;
  province: { name: string };
  metadata_completeness: number;
  metadata_title: string;
  metadata_abstract: string;
  metadata_purpose: string;
  metadata_lineage: string;
  metadata_contact_org: string;
  crs: string;
  created_by: { name: string };
  created_at: string;
  updated_at: string;
}

export interface CarbonRecord {
  id: number;
  plot_id: number;
  plot_code: string;
  recorded_year: number;
  carbon_stock_tonnes: number;
  calculation_method: string;
  confidence: number;
  status: string;
  metadata_completeness: number;
  verified_at: string | null;
  created_at: string;
}

export interface AIAssessment {
  id: number;
  assessment_type: string;
  plot_code: string;
  plot_id: number;
  confidence: number;
  model_version: string;
  result: Record<string, unknown>;
  status: string;
  assessed_at: string;
}

export interface Alert {
  id: number;
  alert_type: string;
  plot_code: string;
  plot_id: number;
  severity: string;
  status: string;
  message: string;
  detected_at: string;
  created_at: string;
}

export interface Report {
  id: number;
  name: string;
  report_type: string;
  status: string;
  size_mb: number;
  created_by: { name: string };
  created_at: string;
}

// ─── USERS ────────────────────────────────────────────────────────
const ALL_PERMISSIONS = [
  'plots.view', 'plots.create', 'plots.edit', 'plots.delete',
  'metadata.edit', 'carbon.view', 'carbon.create', 'carbon.verify',
  'alert.view', 'alerts.manage', 'report.generate', 'reports.export', 'dashboard.view',
];

const RANGER_PERMISSIONS = ['plots.view', 'carbon.view', 'alert.view', 'dashboard.view', 'report.generate'];
const ACADEMIC_PERMISSIONS = ['plots.view', 'carbon.view', 'carbon.create', 'alert.view', 'dashboard.view', 'report.generate', 'reports.export'];
const VIEWER_PERMISSIONS = ['plots.view', 'carbon.view', 'alert.view', 'dashboard.view', 'reports.export'];

export const USERS: Record<string, { user: User; password: string }> = {
  'admin@terraforest.vn': {
    password: 'password',
    user: {
      id: 1, name: 'Terra Admin', email: 'admin@terraforest.vn',
      roles: [{ name: 'admin', permissions: ALL_PERMISSIONS }],
    },
  },
  'ranger@terraforest.vn': {
    password: 'password',
    user: {
      id: 2, name: 'Forest Ranger', email: 'ranger@terraforest.vn',
      roles: [{ name: 'ranger', permissions: RANGER_PERMISSIONS }],
    },
  },
  'academic@terraforest.vn': {
    password: 'password',
    user: {
      id: 3, name: 'NLU Researcher', email: 'academic@terraforest.vn',
      roles: [{ name: 'nlu_academic', permissions: ACADEMIC_PERMISSIONS }],
    },
  },
  'viewer@terraforest.vn': {
    password: 'password',
    user: {
      id: 4, name: 'Government Viewer', email: 'viewer@terraforest.vn',
      roles: [{ name: 'gov_viewer', permissions: VIEWER_PERMISSIONS }],
    },
  },
};

// ─── TOKEN STORE (in-memory) ─────────────────────────────────────
export const tokenStore: Record<string, User> = {};

export function generateToken(): string {
  return 'tf_mock_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function getUserFromAuth(authHeader: string | null): User | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  return tokenStore[token] || null;
}

// ─── PLOTS ────────────────────────────────────────────────────────
export const PLOTS: Plot[] = [
  {
    id: 1, plot_code: 'DN_BGM_001', area_ha: 125.5, forest_type: 'natural',
    status: 'active', latitude: 11.97, longitude: 107.23, province_id: 1,
    province: { name: 'Bu Gia Map' }, metadata_completeness: 85,
    metadata_title: 'Bu Gia Map Primary Forest Plot 1',
    metadata_abstract: 'Primary evergreen forest monitoring plot in Bu Gia Map National Park',
    metadata_purpose: 'Carbon stock monitoring and REDD+ verification',
    metadata_lineage: 'Field survey data combined with Sentinel-2 satellite imagery',
    metadata_contact_org: 'Terra Tech Vietnam', crs: 'EPSG:4326',
    created_by: { name: 'Terra Admin' }, created_at: '2024-01-15T08:00:00Z', updated_at: '2024-06-20T14:30:00Z',
  },
  {
    id: 2, plot_code: 'DN_BGM_002', area_ha: 89.3, forest_type: 'plantation',
    status: 'active', latitude: 11.95, longitude: 107.25, province_id: 1,
    province: { name: 'Bu Gia Map' }, metadata_completeness: 72,
    metadata_title: 'Bu Gia Map Plantation Plot 2',
    metadata_abstract: 'Acacia plantation monitoring plot',
    metadata_purpose: 'Reforestation tracking and carbon sequestration assessment',
    metadata_lineage: 'Aerial survey and ground truth verification',
    metadata_contact_org: 'Dong Nai DONRE', crs: 'EPSG:4326',
    created_by: { name: 'Forest Ranger' }, created_at: '2024-02-10T10:00:00Z', updated_at: '2024-07-15T09:00:00Z',
  },
  {
    id: 3, plot_code: 'DN_BGM_003', area_ha: 210.8, forest_type: 'natural',
    status: 'active', latitude: 11.92, longitude: 107.19, province_id: 1,
    province: { name: 'Bu Gia Map' }, metadata_completeness: 90,
    metadata_title: 'Bu Gia Map Core Zone Plot 3',
    metadata_abstract: 'Core zone primary forest in Bu Gia Map National Park',
    metadata_purpose: 'Biodiversity and carbon baseline monitoring',
    metadata_lineage: 'LiDAR survey combined with field inventory',
    metadata_contact_org: 'Nong Lam University', crs: 'EPSG:4326',
    created_by: { name: 'NLU Researcher' }, created_at: '2024-03-05T07:30:00Z', updated_at: '2024-08-10T16:00:00Z',
  },
  {
    id: 4, plot_code: 'DN_BGM_004', area_ha: 67.2, forest_type: 'mangrove',
    status: 'degraded', latitude: 11.89, longitude: 107.30, province_id: 1,
    province: { name: 'Bu Gia Map' }, metadata_completeness: 45,
    metadata_title: 'Bu Gia Map Degraded Mangrove Plot 4',
    metadata_abstract: 'Degraded mangrove area requiring restoration assessment',
    metadata_purpose: 'Restoration planning and degradation monitoring',
    metadata_lineage: 'Historical satellite imagery analysis',
    metadata_contact_org: 'Dong Nai DONRE', crs: 'EPSG:4326',
    created_by: { name: 'Terra Admin' }, created_at: '2024-04-20T12:00:00Z', updated_at: '2024-09-01T11:00:00Z',
  },
  {
    id: 5, plot_code: 'DN_BGM_005', area_ha: 156.7, forest_type: 'natural',
    status: 'active', latitude: 12.01, longitude: 107.17, province_id: 1,
    province: { name: 'Bu Gia Map' }, metadata_completeness: 78,
    metadata_title: 'Bu Gia Map Buffer Zone Plot 5',
    metadata_abstract: 'Buffer zone forest monitoring plot',
    metadata_purpose: 'Buffer zone encroachment monitoring and carbon assessment',
    metadata_lineage: 'Drone survey and participatory mapping',
    metadata_contact_org: 'Terra Tech Vietnam', crs: 'EPSG:4326',
    created_by: { name: 'Forest Ranger' }, created_at: '2024-05-12T09:00:00Z', updated_at: '2024-10-05T08:30:00Z',
  },
  {
    id: 6, plot_code: 'DN_BGM_006', area_ha: 43.1, forest_type: 'plantation',
    status: 'pending', latitude: 11.98, longitude: 107.21, province_id: 1,
    province: { name: 'Bu Gia Map' }, metadata_completeness: 30,
    metadata_title: 'Bu Gia Map New Plantation Plot 6',
    metadata_abstract: 'Newly registered plantation area pending verification',
    metadata_purpose: 'New plantation registration and baseline assessment',
    metadata_lineage: 'Submitted by local forestry unit',
    metadata_contact_org: 'Dong Nai DONRE', crs: 'EPSG:4326',
    created_by: { name: 'Terra Admin' }, created_at: '2024-11-01T14:00:00Z', updated_at: '2024-11-01T14:00:00Z',
  },
];

// ─── CARBON RECORDS ───────────────────────────────────────────────
export const CARBON_RECORDS: CarbonRecord[] = [
  { id: 1, plot_id: 1, plot_code: 'DN_BGM_001', recorded_year: 2022, carbon_stock_tonnes: 15200, calculation_method: 'remote_sensing', confidence: 0.92, status: 'verified', metadata_completeness: 88, verified_at: '2024-02-15T10:00:00Z', created_at: '2024-01-20T08:00:00Z' },
  { id: 2, plot_id: 1, plot_code: 'DN_BGM_001', recorded_year: 2023, carbon_stock_tonnes: 15800, calculation_method: 'field_inventory', confidence: 0.95, status: 'verified', metadata_completeness: 92, verified_at: '2024-04-10T14:00:00Z', created_at: '2024-03-15T09:00:00Z' },
  { id: 3, plot_id: 1, plot_code: 'DN_BGM_001', recorded_year: 2024, carbon_stock_tonnes: 16500, calculation_method: 'hybrid', confidence: 0.89, status: 'pending', metadata_completeness: 75, verified_at: null, created_at: '2024-08-20T11:00:00Z' },
  { id: 4, plot_id: 2, plot_code: 'DN_BGM_002', recorded_year: 2023, carbon_stock_tonnes: 8900, calculation_method: 'remote_sensing', confidence: 0.87, status: 'verified', metadata_completeness: 80, verified_at: '2024-05-12T16:00:00Z', created_at: '2024-04-01T10:00:00Z' },
  { id: 5, plot_id: 2, plot_code: 'DN_BGM_002', recorded_year: 2024, carbon_stock_tonnes: 9200, calculation_method: 'remote_sensing', confidence: 0.85, status: 'needs_review', metadata_completeness: 65, verified_at: null, created_at: '2024-09-05T13:00:00Z' },
  { id: 6, plot_id: 3, plot_code: 'DN_BGM_003', recorded_year: 2022, carbon_stock_tonnes: 28500, calculation_method: 'field_inventory', confidence: 0.97, status: 'verified', metadata_completeness: 95, verified_at: '2024-01-20T09:00:00Z', created_at: '2023-12-10T08:00:00Z' },
  { id: 7, plot_id: 3, plot_code: 'DN_BGM_003', recorded_year: 2023, carbon_stock_tonnes: 29100, calculation_method: 'field_inventory', confidence: 0.96, status: 'verified', metadata_completeness: 93, verified_at: '2024-06-15T11:00:00Z', created_at: '2024-05-20T10:00:00Z' },
  { id: 8, plot_id: 3, plot_code: 'DN_BGM_003', recorded_year: 2024, carbon_stock_tonnes: 29800, calculation_method: 'hybrid', confidence: 0.91, status: 'pending', metadata_completeness: 78, verified_at: null, created_at: '2024-10-01T15:00:00Z' },
  { id: 9, plot_id: 4, plot_code: 'DN_BGM_004', recorded_year: 2023, carbon_stock_tonnes: 4200, calculation_method: 'remote_sensing', confidence: 0.78, status: 'needs_review', metadata_completeness: 55, verified_at: null, created_at: '2024-07-10T09:00:00Z' },
  { id: 10, plot_id: 5, plot_code: 'DN_BGM_005', recorded_year: 2023, carbon_stock_tonnes: 18900, calculation_method: 'hybrid', confidence: 0.88, status: 'verified', metadata_completeness: 82, verified_at: '2024-08-05T10:00:00Z', created_at: '2024-07-15T08:00:00Z' },
  { id: 11, plot_id: 5, plot_code: 'DN_BGM_005', recorded_year: 2024, carbon_stock_tonnes: 19500, calculation_method: 'remote_sensing', confidence: 0.86, status: 'pending', metadata_completeness: 70, verified_at: null, created_at: '2024-11-10T12:00:00Z' },
];

// ─── AI ASSESSMENTS ───────────────────────────────────────────────
export const AI_ASSESSMENTS: AIAssessment[] = [
  { id: 1, assessment_type: 'carbon_estimation', plot_code: 'DN_BGM_001', plot_id: 1, confidence: 0.89, model_version: 'v2.1', result: { estimated_stock: 16400, method: 'SAR fusion' }, status: 'needs_human_review', assessed_at: '2024-10-15T08:00:00Z' },
  { id: 2, assessment_type: 'degradation_detection', plot_code: 'DN_BGM_004', plot_id: 4, confidence: 0.72, model_version: 'v1.5', result: { degradation_detected: true, severity: 'moderate', area_affected_ha: 23.5 }, status: 'needs_human_review', assessed_at: '2024-10-20T14:00:00Z' },
  { id: 3, assessment_type: 'species_classification', plot_code: 'DN_BGM_003', plot_id: 3, confidence: 0.94, model_version: 'v3.0', result: { dominant_species: 'Dipterocarp', secondary_species: ['Shorea', 'Hopea'] }, status: 'needs_human_review', assessed_at: '2024-11-01T10:00:00Z' },
  { id: 4, assessment_type: 'carbon_estimation', plot_code: 'DN_BGM_005', plot_id: 5, confidence: 0.86, model_version: 'v2.1', result: { estimated_stock: 19200, method: 'LiDAR+SAR' }, status: 'approved', assessed_at: '2024-09-20T16:00:00Z' },
  { id: 5, assessment_type: 'degradation_detection', plot_code: 'DN_BGM_002', plot_id: 2, confidence: 0.68, model_version: 'v1.5', result: { degradation_detected: false, health_index: 0.82 }, status: 'needs_human_review', assessed_at: '2024-11-05T11:00:00Z' },
];

// ─── ALERTS ───────────────────────────────────────────────────────
export const ALERTS: Alert[] = [
  { id: 1, alert_type: 'fire_risk', plot_code: 'DN_BGM_001', plot_id: 1, severity: 'high', status: 'active', message: 'High fire risk detected due to prolonged dry season', detected_at: '2024-11-10T06:00:00Z', created_at: '2024-11-10T06:00:00Z' },
  { id: 2, alert_type: 'encroachment', plot_code: 'DN_BGM_004', plot_id: 4, severity: 'critical', status: 'active', message: 'Illegal encroachment detected in degraded mangrove area', detected_at: '2024-11-08T14:00:00Z', created_at: '2024-11-08T14:00:00Z' },
  { id: 3, alert_type: 'deforestation', plot_code: 'DN_BGM_005', plot_id: 5, severity: 'medium', status: 'active', message: 'Moderate deforestation signal detected in buffer zone', detected_at: '2024-11-05T09:00:00Z', created_at: '2024-11-05T09:00:00Z' },
  { id: 4, alert_type: 'fire_risk', plot_code: 'DN_BGM_003', plot_id: 3, severity: 'low', status: 'resolved', message: 'Low fire risk — monitored area recovered after rainfall', detected_at: '2024-10-20T08:00:00Z', created_at: '2024-10-20T08:00:00Z' },
  { id: 5, alert_type: 'flooding', plot_code: 'DN_BGM_004', plot_id: 4, severity: 'medium', status: 'active', message: 'Seasonal flooding detected in lowland mangrove area', detected_at: '2024-11-12T10:00:00Z', created_at: '2024-11-12T10:00:00Z' },
];

// ─── REPORTS ──────────────────────────────────────────────────────
export const REPORTS: Report[] = [
  { id: 1, name: 'Q3 2024 Carbon Stock Report', report_type: 'carbon', status: 'completed', size_mb: 2.4, created_by: { name: 'Terra Admin' }, created_at: '2024-10-01T08:00:00Z' },
  { id: 2, name: 'Annual Summary 2024', report_type: 'summary', status: 'completed', size_mb: 5.1, created_by: { name: 'Terra Admin' }, created_at: '2024-09-15T10:00:00Z' },
  { id: 3, name: 'Alert Report November 2024', report_type: 'alerts', status: 'pending', size_mb: 0, created_by: { name: 'Forest Ranger' }, created_at: '2024-11-10T14:00:00Z' },
  { id: 4, name: 'Full Compliance Report Q4 2024', report_type: 'full', status: 'generating', size_mb: 0, created_by: { name: 'Terra Admin' }, created_at: '2024-11-12T09:00:00Z' },
];

// ─── HELPER ───────────────────────────────────────────────────────
export function success(data: unknown, meta?: Record<string, unknown>) {
  return { data, ...(meta ? { meta } : {}) };
}
