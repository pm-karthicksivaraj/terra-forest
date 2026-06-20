import { NextResponse } from 'next/server'

const ALERT_TYPES = [
  {
    type: 'alert',
    title: 'Fire Risk Detected',
    titleEn: 'Fire Risk Detected',
    severities: ['critical', 'high'],
    messages: [
      'Surface temperature exceeds threshold at Bu Gia Map area',
      'Extreme fire weather index at plot DN_BGM_012',
      'Fire alert from Sentinel-2 satellite in Dong Nai province',
      'Sudden ground surface temperature increase at Bu Gia Map National Park',
      'Thermal hotspot detected at plot DN_BGM_005',
    ],
  },
  {
    type: 'alert',
    title: 'Deforestation Alert',
    titleEn: 'Deforestation Alert',
    severities: ['high', 'critical'],
    messages: [
      'Forest loss of 2.3ha detected at plot DN_BGM_007 from Sentinel-2',
      'NDVI comparison shows 18% decrease at Bu Gia Map National Park area',
      'Abnormal forest cover change detected at plot DN_BGM_019',
      'Illegal logging alert in Dak Nong province area',
      'Deforestation of 5.1ha detected via Landsat-9 imagery',
    ],
  },
  {
    type: 'alert',
    title: 'AI Detection Result',
    titleEn: 'AI Detection Result',
    severities: ['medium', 'low'],
    messages: [
      'DeepForest model detected 47 new tree canopies at plot DN_BGM_003',
      'SAM-Geo updated boundary for plot DN_BGM_015 with 92% confidence',
      'EfficientNet-B4 identified Hopea odorata species at plot DN_BGM_021',
      'Invasive species detected at plot DN_BGM_009 with 78% confidence',
    ],
  },
  {
    type: 'pipeline_progress',
    title: 'Pipeline Progress',
    titleEn: 'Pipeline Progress',
    severities: ['low'],
    messages: [
      'Boundary detection step completed for plot DN_BGM_005',
      'AI analysis processing step 2/3 for plot DN_BGM_011',
      'AI pipeline completed analysis for plot DN_BGM_008',
    ],
  },
  {
    type: 'carbon_update',
    title: 'Carbon Stock Update',
    titleEn: 'Carbon Stock Update',
    severities: ['low', 'medium'],
    messages: [
      'New carbon record for plot DN_BGM_003: 145.2 tonnes/ha (year 2024)',
      'Accumulated carbon stock update: +3.2% compared to previous year',
      'Automated carbon verification successful for plot DN_BGM_014',
    ],
  },
  {
    type: 'compliance_change',
    title: 'Compliance Status Change',
    titleEn: 'Compliance Status Change',
    severities: ['medium'],
    messages: [
      'Plot DN_BGM_009 achieved full VPA/FLEGT compliance',
      'Plot DN_BGM_017 requires additional ISO 19115 lineage documentation',
      'Compliance verification successful for plot DN_BGM_002',
    ],
  },
]

interface AlertEntry {
  id: string;
  type: string;
  title: string;
  titleEn: string;
  message: string;
  severity: string;
  topic: string;
  payload: { plot_code: string; message: string };
  timestamp: string;
  read: boolean;
}

const PLOTS = [
  'DN_BGM_001', 'DN_BGM_003', 'DN_BGM_005', 'DN_BGM_007',
  'DN_BGM_008', 'DN_BGM_009', 'DN_BGM_011', 'DN_BGM_012',
  'DN_BGM_014', 'DN_BGM_015', 'DN_BGM_017', 'DN_BGM_019', 'DN_BGM_021',
]

const TOPICS = [
  'terra-forest.alerts',
  'terra-forest.pipeline',
  'terra-forest.carbon',
  'terra-forest.compliance',
]

function generateAlerts(count: number): AlertEntry[] {
  const alerts: AlertEntry[] = []
  const now = Date.now()

  for (let i = 0; i < count; i++) {
    const alertType = ALERT_TYPES[Math.floor(Math.random() * ALERT_TYPES.length)]
    const severity = alertType.severities[Math.floor(Math.random() * alertType.severities.length)]
    const message = alertType.messages[Math.floor(Math.random() * alertType.messages.length)]
    const plot = PLOTS[Math.floor(Math.random() * PLOTS.length)]
    const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)]

    // Generate timestamps going back in time
    const hoursAgo = Math.floor(Math.random() * 168) // Up to 7 days
    const timestamp = new Date(now - hoursAgo * 3600000).toISOString()

    alerts.push({
      id: `alert_${i + 1}`,
      type: alertType.type,
      title: alertType.title,
      titleEn: alertType.titleEn,
      message,
      severity,
      topic,
      payload: {
        plot_code: plot,
        message,
      },
      timestamp,
      read: Math.random() > 0.4, // 60% unread
    })
  }

  // Sort by timestamp, newest first
  alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return alerts
}

// Generate 18 alerts
const alertHistory = generateAlerts(18)

export async function GET() {
  return NextResponse.json({
    data: alertHistory,
    meta: {
      total: alertHistory.length,
      timestamp: new Date().toISOString(),
    },
  })
}
