import { NextResponse } from 'next/server'

const dbStats = {
  totalSize: '24.7 GB',
  partitions: [
    { name: 'forest_plots_2024_se', province: 'Dong Nai', year: 2024, size: '4.2 GB', rows: 125840, status: 'active' },
    { name: 'forest_plots_2024_tn', province: 'Dak Lak', year: 2024, size: '3.8 GB', rows: 108320, status: 'active' },
    { name: 'forest_plots_2024_mekong', province: 'Ca Mau', year: 2024, size: '2.9 GB', rows: 87640, status: 'active' },
    { name: 'forest_plots_2023_se', province: 'Dong Nai', year: 2023, size: '4.1 GB', rows: 122100, status: 'archived' },
    { name: 'forest_plots_2023_tn', province: 'Dak Lak', year: 2023, size: '3.6 GB', rows: 103400, status: 'archived' },
    { name: 'forest_plots_2023_mekong', province: 'Ca Mau', year: 2023, size: '2.8 GB', rows: 84200, status: 'archived' },
    { name: 'carbon_records_se', province: 'Binh Phuoc', year: 2024, size: '1.9 GB', rows: 56780, status: 'active' },
    { name: 'carbon_records_tn', province: 'Lam Dong', year: 2024, size: '1.4 GB', rows: 42100, status: 'active' },
  ],
  queryPerformance: [
    { query: 'SELECT * FROM forest_plots WHERE ST_Contains(geom, $1)', avgTime: 12, callsPerSec: 45, cacheHitRate: 94 },
    { query: 'SELECT SUM(carbon_stock) FROM carbon_records WHERE plot_id = $1', avgTime: 8, callsPerSec: 120, cacheHitRate: 97 },
    { query: 'SELECT * FROM alerts WHERE severity = $1 ORDER BY created_at DESC', avgTime: 15, callsPerSec: 67, cacheHitRate: 88 },
    { query: 'SELECT COUNT(*) FROM forest_plots WHERE status = $1 GROUP BY province', avgTime: 22, callsPerSec: 23, cacheHitRate: 82 },
    { query: 'UPDATE carbon_records SET status = $1 WHERE id = $2', avgTime: 5, callsPerSec: 15, cacheHitRate: 99 },
    { query: 'SELECT * FROM ai_assessments WHERE confidence < $1', avgTime: 18, callsPerSec: 34, cacheHitRate: 76 },
  ],
}

export async function GET() {
  return NextResponse.json({ data: dbStats })
}
