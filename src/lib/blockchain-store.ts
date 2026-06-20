// Terra Forest Blockchain Mock Data Store
// Shared data for blockchain mock API routes

export interface CarbonCredit {
  id: number;
  credit_id: string;
  carbon_record_id: number;
  plot_code: string;
  co2e_amount: number;
  vintage_year: number;
  status: 'minted' | 'verified' | 'retired';
  tx_hash: string;
  created_at: string;
}

export interface TimberPassport {
  id: number;
  passport_id: string;
  plot_id: number;
  plot_code: string;
  species: string;
  volume: number;
  vpa_flegt_status: 'verified' | 'pending' | 'rejected';
  passport_hash: string;
  status: 'active' | 'expired' | 'revoked';
  export_ready: boolean;
  created_at: string;
}

export interface BlockchainTransaction {
  id: number;
  tx_hash: string;
  type: 'credit' | 'passport';
  description: string;
  block_number: number;
  created_at: string;
}

let nextCreditId = 7;
let nextPassportId = 5;

export const CREDITS: CarbonCredit[] = [
  {
    id: 1, credit_id: 'CC-001', carbon_record_id: 1, plot_code: 'DN_BGM_001',
    co2e_amount: 15200, vintage_year: 2022, status: 'verified',
    tx_hash: '0x7a3b8c9d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1',
    created_at: '2024-03-15T10:00:00Z',
  },
  {
    id: 2, credit_id: 'CC-002', carbon_record_id: 2, plot_code: 'DN_BGM_001',
    co2e_amount: 15800, vintage_year: 2023, status: 'verified',
    tx_hash: '0x1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a2b',
    created_at: '2024-05-20T14:00:00Z',
  },
  {
    id: 3, credit_id: 'CC-003', carbon_record_id: 4, plot_code: 'DN_BGM_002',
    co2e_amount: 8900, vintage_year: 2023, status: 'minted',
    tx_hash: '0x2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a3c4',
    created_at: '2024-06-12T16:00:00Z',
  },
  {
    id: 4, credit_id: 'CC-004', carbon_record_id: 6, plot_code: 'DN_BGM_003',
    co2e_amount: 28500, vintage_year: 2022, status: 'verified',
    tx_hash: '0x3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a4d5e',
    created_at: '2024-02-25T09:00:00Z',
  },
  {
    id: 5, credit_id: 'CC-005', carbon_record_id: 7, plot_code: 'DN_BGM_003',
    co2e_amount: 29100, vintage_year: 2023, status: 'retired',
    tx_hash: '0x4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a5e6f',
    created_at: '2024-07-15T11:00:00Z',
  },
  {
    id: 6, credit_id: 'CC-006', carbon_record_id: 10, plot_code: 'DN_BGM_005',
    co2e_amount: 18900, vintage_year: 2023, status: 'minted',
    tx_hash: '0x5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a6f7a8',
    created_at: '2024-09-05T10:00:00Z',
  },
];

export const PASSPORTS: TimberPassport[] = [
  {
    id: 1, passport_id: 'TP-001', plot_id: 1, plot_code: 'DN_BGM_001',
    species: 'Dipterocarpus alatus', volume: 450.5,
    vpa_flegt_status: 'verified', status: 'active', export_ready: true,
    passport_hash: '0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0b1',
    created_at: '2024-04-01T08:00:00Z',
  },
  {
    id: 2, passport_id: 'TP-002', plot_id: 3, plot_code: 'DN_BGM_003',
    species: 'Aquilaria crassna', volume: 120.3,
    vpa_flegt_status: 'verified', status: 'active', export_ready: true,
    passport_hash: '0xb2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0c2d3',
    created_at: '2024-06-20T12:00:00Z',
  },
  {
    id: 3, passport_id: 'TP-003', plot_id: 5, plot_code: 'DN_BGM_005',
    species: 'Dalbergia cochinchinensis', volume: 85.7,
    vpa_flegt_status: 'pending', status: 'active', export_ready: false,
    passport_hash: '0xc3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0d3e4',
    created_at: '2024-08-10T15:00:00Z',
  },
  {
    id: 4, passport_id: 'TP-004', plot_id: 2, plot_code: 'DN_BGM_002',
    species: 'Acacia mangium', volume: 620.0,
    vpa_flegt_status: 'verified', status: 'active', export_ready: true,
    passport_hash: '0xd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0e4f5',
    created_at: '2024-10-05T09:00:00Z',
  },
];

export const TRANSACTIONS: BlockchainTransaction[] = [
  { id: 1, tx_hash: '0x7a3b8c9d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1', type: 'credit', description: 'Mint carbon credit CC-001 for DN_BGM_001', block_number: 1234, created_at: '2024-03-15T10:00:00Z' },
  { id: 2, tx_hash: '0x1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a2b', type: 'credit', description: 'Mint carbon credit CC-002 for DN_BGM_001', block_number: 1240, created_at: '2024-05-20T14:00:00Z' },
  { id: 3, tx_hash: '0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0b1', type: 'passport', description: 'Issue timber passport TP-001 for DN_BGM_001', block_number: 1238, created_at: '2024-04-01T08:00:00Z' },
  { id: 4, tx_hash: '0x3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a4d5e', type: 'credit', description: 'Mint carbon credit CC-004 for DN_BGM_003', block_number: 1242, created_at: '2024-02-25T09:00:00Z' },
  { id: 5, tx_hash: '0xb2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0c2d3', type: 'passport', description: 'Issue timber passport TP-002 for DN_BGM_003', block_number: 1245, created_at: '2024-06-20T12:00:00Z' },
  { id: 6, tx_hash: '0x2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a3c4', type: 'credit', description: 'Mint carbon credit CC-003 for DN_BGM_002', block_number: 1241, created_at: '2024-06-12T16:00:00Z' },
  { id: 7, tx_hash: '0x5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a6f7a8', type: 'credit', description: 'Mint carbon credit CC-006 for DN_BGM_005', block_number: 1246, created_at: '2024-09-05T10:00:00Z' },
  { id: 8, tx_hash: '0xd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0e4f5', type: 'passport', description: 'Issue timber passport TP-004 for DN_BGM_002', block_number: 1247, created_at: '2024-10-05T09:00:00Z' },
];

export function generateTxHash(): string {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * 16)];
  }
  return hash;
}

export function addCredit(carbonRecordId: number, plotCode: string, co2e: number, vintageYear: number): CarbonCredit {
  const id = nextCreditId++;
  const credit: CarbonCredit = {
    id,
    credit_id: `CC-${String(id).padStart(3, '0')}`,
    carbon_record_id: carbonRecordId,
    plot_code: plotCode,
    co2e_amount: co2e,
    vintage_year: vintageYear,
    status: 'minted',
    tx_hash: generateTxHash(),
    created_at: new Date().toISOString(),
  };
  CREDITS.unshift(credit);
  return credit;
}

export function addPassport(plotId: number, plotCode: string, vpaFlegtVerified: boolean): TimberPassport {
  const id = nextPassportId++;
  const speciesList = ['Dipterocarpus alatus', 'Aquilaria crassna', 'Dalbergia cochinchinensis', 'Acacia mangium', 'Pinus dalatensis'];
  const passport: TimberPassport = {
    id,
    passport_id: `TP-${String(id).padStart(3, '0')}`,
    plot_id: plotId,
    plot_code: plotCode,
    species: speciesList[Math.floor(Math.random() * speciesList.length)],
    volume: Math.round((Math.random() * 500 + 50) * 10) / 10,
    vpa_flegt_status: vpaFlegtVerified ? 'verified' : 'pending',
    status: 'active',
    export_ready: vpaFlegtVerified,
    passport_hash: generateTxHash(),
    created_at: new Date().toISOString(),
  };
  PASSPORTS.unshift(passport);
  return passport;
}

export function verifyCreditById(creditId: number): CarbonCredit | null {
  const credit = CREDITS.find(c => c.id === creditId);
  if (credit) {
    credit.status = 'verified';
  }
  return credit || null;
}
