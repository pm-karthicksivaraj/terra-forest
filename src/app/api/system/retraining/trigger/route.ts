import { NextResponse } from 'next/server'

export async function POST() {
  // Simulate triggering retraining
  const result = {
    status: 'collecting',
    correctionsCount: 100,
    threshold: 100,
    lastTraining: '2024-12-01 03:00',
    modelVersion: 'v3.2.1',
    accuracy: 0.943,
    datasetSize: 128500,
    trainingHistory: [
      { date: new Date().toISOString().slice(0, 10), version: 'v3.3.0', accuracy: 0, datasetSize: 128500, status: 'collecting' },
      { date: '2024-12-01', version: 'v3.2.1', accuracy: 0.943, datasetSize: 128500, status: 'deployed' },
      { date: '2024-11-01', version: 'v3.2.0', accuracy: 0.938, datasetSize: 119200, status: 'deployed' },
      { date: '2024-10-01', version: 'v3.1.0', accuracy: 0.941, datasetSize: 112800, status: 'completed' },
      { date: '2024-09-01', version: 'v3.0.0', accuracy: 0.935, datasetSize: 105400, status: 'completed' },
      { date: '2024-08-01', version: 'v2.1.0', accuracy: 0.929, datasetSize: 98700, status: 'completed' },
      { date: '2024-07-01', version: 'v2.0.0', accuracy: 0.921, datasetSize: 89500, status: 'completed' },
    ],
  }

  return NextResponse.json({ data: result })
}
