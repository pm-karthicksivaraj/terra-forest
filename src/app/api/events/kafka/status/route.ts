import { NextResponse } from 'next/server'

export async function GET() {
  const kafkaStatus = {
    isHealthy: true,
    brokers: [
      { id: 1, host: 'kafka-1.terraforest.vn', port: 9092, isHealthy: true },
      { id: 2, host: 'kafka-2.terraforest.vn', port: 9092, isHealthy: true },
      { id: 3, host: 'kafka-3.terraforest.vn', port: 9092, isHealthy: true },
    ],
    topics: [
      {
        name: 'terra-forest.alerts',
        partitions: 6,
        messagesPerSec: 2.4,
        consumerLag: 12,
        subscribed: true,
      },
      {
        name: 'terra-forest.pipeline',
        partitions: 3,
        messagesPerSec: 0.8,
        consumerLag: 5,
        subscribed: true,
      },
      {
        name: 'terra-forest.carbon',
        partitions: 3,
        messagesPerSec: 0.3,
        consumerLag: 2,
        subscribed: false,
      },
      {
        name: 'terra-forest.compliance',
        partitions: 3,
        messagesPerSec: 0.1,
        consumerLag: 0,
        subscribed: false,
      },
    ],
    consumerGroups: [
      { id: 'cg-alert-processor', members: 3, lag: 12 },
      { id: 'cg-pipeline-worker', members: 2, lag: 5 },
    ],
  }

  return NextResponse.json({
    data: kafkaStatus,
    meta: { timestamp: new Date().toISOString() },
  })
}
