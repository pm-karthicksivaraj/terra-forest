// In-memory data governance store for mock API

interface MetadataRecord {
  id: number
  plot_id: number
  title: string
  abstract: string
  iso_standard: string
  status: 'draft' | 'published' | 'archived'
  created_at: string
  geo_network_url?: string
}

interface SyncLogEntry {
  id: number
  synced_at: string
  records_synced: number
  status: 'success' | 'failed' | 'syncing'
  duration: number
  errors: string[]
}

interface FrmsSyncStatus {
  lastSync: string | null
  nextSync: string | null
  status: 'idle' | 'syncing' | 'success' | 'failed'
  recordsSynced: number
  errors: string[]
}

let syncStatus: FrmsSyncStatus = {
  lastSync: '2025-03-04T08:30:00Z',
  nextSync: '2025-03-05T08:30:00Z',
  status: 'idle',
  recordsSynced: 0,
  errors: [],
}

let syncLogNextId = 9

const metadataRecords: MetadataRecord[] = [
  {
    id: 1, plot_id: 1,
    title: 'Forest Plot DN_BGM_001 - Forest Monitoring Data',
    abstract: 'ISO 19115 metadata record for forest plot DN_BGM_001 at Bu Gia Map National Park, Dong Nai Province. Includes boundary data, forest type, and carbon stock.',
    iso_standard: 'ISO 19115:2014',
    status: 'published',
    created_at: '2025-01-15T10:30:00Z',
    geo_network_url: 'https://geonetwork.terraforest.vn/srv/vnm/catalog.search#/metadata/MD-1',
  },
  {
    id: 2, plot_id: 2,
    title: 'Forest Plot DN_BGM_002 - Forest Monitoring Data',
    abstract: 'Metadata record for forest plot DN_BGM_002. Biodiversity and carbon stock data.',
    iso_standard: 'ISO 19115:2014',
    status: 'published',
    created_at: '2025-01-16T11:00:00Z',
    geo_network_url: 'https://geonetwork.terraforest.vn/srv/vnm/catalog.search#/metadata/MD-2',
  },
  {
    id: 3, plot_id: 3,
    title: 'Forest Plot DN_BGM_003 - Biodiversity Data',
    abstract: 'Metadata for natural forest area DN_BGM_003 with AI detection and species classification data.',
    iso_standard: 'ISO 19115:2014',
    status: 'draft',
    created_at: '2025-02-01T09:15:00Z',
  },
  {
    id: 4, plot_id: 4,
    title: 'Forest Plot DN_BGM_004 - Boundary Data',
    abstract: 'Boundary data and metadata for plantation forest plot DN_BGM_004.',
    iso_standard: 'ISO 19115:2014',
    status: 'draft',
    created_at: '2025-02-05T14:00:00Z',
  },
  {
    id: 5, plot_id: 5,
    title: 'Forest Plot DN_BGM_005 - Carbon Stock Data',
    abstract: 'Carbon measurement data and metadata for protected forest plot DN_BGM_005.',
    iso_standard: 'ISO 19115:2014',
    status: 'published',
    created_at: '2025-02-10T16:30:00Z',
    geo_network_url: 'https://geonetwork.terraforest.vn/srv/vnm/catalog.search#/metadata/MD-5',
  },
  {
    id: 6, plot_id: 6,
    title: 'Forest Plot DN_BGM_006 - Fire Alert Data',
    abstract: 'Wildfire risk alert metadata for plot DN_BGM_006.',
    iso_standard: 'ISO 19115:2014',
    status: 'archived',
    created_at: '2025-01-20T08:45:00Z',
  },
  {
    id: 7, plot_id: 7,
    title: 'Forest Plot DN_BGM_007 - VPA/FLEGT Data',
    abstract: 'VPA/FLEGT compliance data and metadata for forest plot DN_BGM_007.',
    iso_standard: 'ISO 19115:2014',
    status: 'draft',
    created_at: '2025-02-15T12:00:00Z',
  },
  {
    id: 8, plot_id: 8,
    title: 'Forest Plot DN_BGM_008 - Sentinel-2 Data',
    abstract: 'Sentinel-2 satellite imagery metadata and forest change analysis for plot DN_BGM_008.',
    iso_standard: 'ISO 19115:2014',
    status: 'published',
    created_at: '2025-02-20T10:00:00Z',
    geo_network_url: 'https://geonetwork.terraforest.vn/srv/vnm/catalog.search#/metadata/MD-8',
  },
  {
    id: 9, plot_id: 9,
    title: 'Forest Plot DN_BGM_009 - AI Analysis Data',
    abstract: 'Metadata for AI pipeline analysis results at forest plot DN_BGM_009.',
    iso_standard: 'ISO 19115:2014',
    status: 'draft',
    created_at: '2025-03-01T09:30:00Z',
  },
  {
    id: 10, plot_id: 10,
    title: 'Forest Plot DN_BGM_010 - Mangrove Forest Data',
    abstract: 'Metadata for mangrove forest area DN_BGM_010 with specialized carbon measurement data.',
    iso_standard: 'ISO 19115:2014',
    status: 'archived',
    created_at: '2025-01-25T15:00:00Z',
  },
]

const syncLog: SyncLogEntry[] = [
  { id: 1, synced_at: '2025-02-28T08:30:00Z', records_synced: 45, status: 'success', duration: 127, errors: [] },
  { id: 2, synced_at: '2025-02-27T08:30:00Z', records_synced: 38, status: 'success', duration: 98, errors: [] },
  { id: 3, synced_at: '2025-02-26T08:30:00Z', records_synced: 42, status: 'success', duration: 112, errors: [] },
  { id: 4, synced_at: '2025-02-25T08:30:00Z', records_synced: 15, status: 'failed', duration: 45, errors: ['Connection timeout to FRMS server', 'Retry limit exceeded for batch #3'] },
  { id: 5, synced_at: '2025-02-24T08:30:00Z', records_synced: 50, status: 'success', duration: 134, errors: [] },
  { id: 6, synced_at: '2025-02-23T08:30:00Z', records_synced: 47, status: 'success', duration: 121, errors: [] },
  { id: 7, synced_at: '2025-02-22T08:30:00Z', records_synced: 33, status: 'failed', duration: 67, errors: ['Authentication token expired', 'Data validation error for record #DN_BGM_007'] },
  { id: 8, synced_at: '2025-02-21T08:30:00Z', records_synced: 51, status: 'success', duration: 139, errors: [] },
]

export { metadataRecords, syncLog, syncStatus, syncLogNextId }

export function updateSyncStatus(newStatus: Partial<FrmsSyncStatus>) {
  syncStatus = { ...syncStatus, ...newStatus }
}

export function addSyncLogEntry(entry: SyncLogEntry) {
  syncLog.unshift(entry)
}

export function updateMetadataRecord(id: number, updates: Partial<MetadataRecord>) {
  const idx = metadataRecords.findIndex((r) => r.id === id)
  if (idx !== -1) {
    metadataRecords[idx] = { ...metadataRecords[idx], ...updates }
    return metadataRecords[idx]
  }
  return null
}
