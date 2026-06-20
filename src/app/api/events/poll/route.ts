import { NextResponse } from 'next/server'

const EVENT_TEMPLATES = [
  {
    type: 'alert',
    topic: 'terra-forest.alerts',
    title: 'Fire Risk Detected',
    titleEn: 'Fire Risk Detected',
    severity: 'critical',
    messages: [
      'Surface temperature exceeds threshold at Bu Gia Map area',
      'Extreme fire weather index at plot DN_BGM_012',
    ],
  },
  {
    type: 'alert',
    topic: 'terra-forest.alerts',
    title: 'Deforestation Alert',
    titleEn: 'Deforestation Alert',
    severity: 'high',
    messages: [
      'Forest loss of 2.3ha detected at plot DN_BGM_007',
      'Abnormal forest cover change detected at plot DN_BGM_019',
    ],
  },
  {
    type: 'pipeline_progress',
    topic: 'terra-forest.pipeline',
    title: 'Pipeline Progress',
    titleEn: 'Pipeline Progress',
    severity: 'low',
    messages: [
      'Boundary detection step completed for plot DN_BGM_005',
      'AI analysis processing step 2/3 for plot DN_BGM_011',
    ],
  },
  {
    type: 'carbon_update',
    topic: 'terra-forest.carbon',
    title: 'Carbon Stock Update',
    titleEn: 'Carbon Stock Update',
    severity: 'low',
    messages: [
      'New carbon record for plot DN_BGM_003: 145.2 tonnes/ha',
      'Accumulated carbon stock update: +3.2% compared to previous year',
    ],
  },
  {
    type: 'compliance_change',
    topic: 'terra-forest.compliance',
    title: 'Compliance Status Change',
    titleEn: 'Compliance Status Change',
    severity: 'medium',
    messages: [
      'Plot DN_BGM_009 achieved full VPA/FLEGT compliance',
      'Plot DN_BGM_017 requires additional ISO 19115 lineage documentation',
    ],
  },
]

interface PollEvent {
  id: string;
  type: string;
  topic: string;
  title: string;
  titleEn: string;
  message: string;
  severity: string;
  payload: { plot_code: string; message: string };
  timestamp: string;
}

const PLOTS = [
  'DN_BGM_001', 'DN_BGM_003', 'DN_BGM_005', 'DN_BGM_007',
  'DN_BGM_008', 'DN_BGM_009', 'DN_BGM_011', 'DN_BGM_012',
  'DN_BGM_014', 'DN_BGM_015', 'DN_BGM_017', 'DN_BGM_019', 'DN_BGM_021',
]

let pollCounter = 0

export async function GET() {
  // Return 0-3 random events per poll
  const eventCount = Math.floor(Math.random() * 4) // 0-3
  const events: PollEvent[] = []

  for (let i = 0; i < eventCount; i++) {
    pollCounter++
    const template = EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)]
    const message = template.messages[Math.floor(Math.random() * template.messages.length)]
    const plot = PLOTS[Math.floor(Math.random() * PLOTS.length)]

    events.push({
      id: `poll_${Date.now()}_${pollCounter}`,
      type: template.type,
      topic: template.topic,
      title: template.title,
      titleEn: template.titleEn,
      message,
      severity: template.severity,
      payload: {
        plot_code: plot,
        message,
      },
      timestamp: new Date().toISOString(),
    })
  }

  return NextResponse.json({
    data: { events },
    meta: { timestamp: new Date().toISOString(), count: events.length },
  })
}
