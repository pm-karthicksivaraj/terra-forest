import { NextResponse } from 'next/server'
import { updateSyncStatus, addSyncLogEntry, syncLogNextId } from '@/lib/data-governance-store'

export async function POST() {
  // Start a simulated FRMS sync process
  updateSyncStatus({
    status: 'syncing',
    recordsSynced: 0,
    errors: [],
  })

  // Simulate the sync completing after a short delay
  // In a real system, this would be a background job
  const syncId = syncLogNextId

  // Return immediately with syncing status
  // The client will poll the status endpoint for updates

  // Simulate progressive sync completion
  setTimeout(() => {
    updateSyncStatus({
      recordsSynced: 12,
    })
  }, 2000)

  setTimeout(() => {
    updateSyncStatus({
      recordsSynced: 28,
    })
  }, 5000)

  setTimeout(() => {
    const success = Math.random() > 0.15 // 85% success rate
    if (success) {
      updateSyncStatus({
        status: 'success',
        lastSync: new Date().toISOString(),
        nextSync: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        recordsSynced: 42,
      })
      addSyncLogEntry({
        id: syncId,
        synced_at: new Date().toISOString(),
        records_synced: 42,
        status: 'success',
        duration: 108,
        errors: [],
      })
    } else {
      updateSyncStatus({
        status: 'failed',
        recordsSynced: 15,
        errors: ['FRMS server connection timeout', 'Data validation error for 3 records'],
      })
      addSyncLogEntry({
        id: syncId,
        synced_at: new Date().toISOString(),
        records_synced: 15,
        status: 'failed',
        duration: 52,
        errors: ['FRMS server connection timeout', 'Data validation error for 3 records'],
      })
    }
  }, 8000)

  return NextResponse.json({
    data: {
      status: 'syncing',
      recordsSynced: 0,
      message: 'FRMS sync initiated',
    },
  })
}
