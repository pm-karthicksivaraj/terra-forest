// Shared in-memory store for AI pipeline runs
// Used by all ai-pipeline API routes

export interface PipelineStep {
  name: string;
  key: string;
  status: string;
  progress: number;
  started_at: string | null;
  completed_at: string | null;
}

export interface PipelineRun {
  id: number;
  plot_id: number;
  plot_code: string;
  steps: string[];
  step_details: PipelineStep[];
  status: string;
  confidence: number;
  override: boolean;
  started_at: string;
  completed_at: string | null;
  created_at: string;
}

// Use global to persist across hot reloads
const globalForStore = globalThis as unknown as {
  __pipelineRuns: PipelineRun[] | undefined;
  __pipelineNextId: number | undefined;
};

const SEED_RUNS: PipelineRun[] = [
  {
    id: 1,
    plot_id: 1,
    plot_code: 'DN_BGM_001',
    steps: ['boundary', 'crown', 'species'],
    step_details: [
      { name: 'Boundary Detection', key: 'boundary', status: 'completed', progress: 100, started_at: '2024-11-01T10:00:00Z', completed_at: '2024-11-01T10:02:30Z' },
      { name: 'Crown Detection', key: 'crown', status: 'completed', progress: 100, started_at: '2024-11-01T10:02:30Z', completed_at: '2024-11-01T10:05:45Z' },
      { name: 'Species Classification', key: 'species', status: 'completed', progress: 100, started_at: '2024-11-01T10:05:45Z', completed_at: '2024-11-01T10:08:20Z' },
    ],
    status: 'completed',
    confidence: 80,
    override: false,
    started_at: '2024-11-01T10:00:00Z',
    completed_at: '2024-11-01T10:08:20Z',
    created_at: '2024-11-01T10:00:00Z',
  },
  {
    id: 2,
    plot_id: 3,
    plot_code: 'DN_BGM_003',
    steps: ['boundary', 'crown'],
    step_details: [
      { name: 'Boundary Detection', key: 'boundary', status: 'completed', progress: 100, started_at: '2024-11-05T14:00:00Z', completed_at: '2024-11-05T14:03:10Z' },
      { name: 'Crown Detection', key: 'crown', status: 'failed', progress: 67, started_at: '2024-11-05T14:03:10Z', completed_at: '2024-11-05T14:05:00Z' },
    ],
    status: 'failed',
    confidence: 85,
    override: false,
    started_at: '2024-11-05T14:00:00Z',
    completed_at: '2024-11-05T14:05:00Z',
    created_at: '2024-11-05T14:00:00Z',
  },
  {
    id: 3,
    plot_id: 2,
    plot_code: 'DN_BGM_002',
    steps: ['boundary', 'crown', 'species'],
    step_details: [
      { name: 'Boundary Detection', key: 'boundary', status: 'completed', progress: 100, started_at: '2024-11-10T09:00:00Z', completed_at: '2024-11-10T09:02:00Z' },
      { name: 'Crown Detection', key: 'crown', status: 'completed', progress: 100, started_at: '2024-11-10T09:02:00Z', completed_at: '2024-11-10T09:05:30Z' },
      { name: 'Species Classification', key: 'species', status: 'completed', progress: 100, started_at: '2024-11-10T09:05:30Z', completed_at: '2024-11-10T09:07:45Z' },
    ],
    status: 'completed',
    confidence: 90,
    override: true,
    started_at: '2024-11-10T09:00:00Z',
    completed_at: '2024-11-10T09:07:45Z',
    created_at: '2024-11-10T09:00:00Z',
  },
];

export function getPipelineRuns(): PipelineRun[] {
  if (!globalForStore.__pipelineRuns) {
    globalForStore.__pipelineRuns = [...SEED_RUNS];
    globalForStore.__pipelineNextId = 4;
  }
  return globalForStore.__pipelineRuns;
}

export function getNextRunId(): number {
  getPipelineRuns(); // ensure initialized
  return globalForStore.__pipelineNextId!++;
}
