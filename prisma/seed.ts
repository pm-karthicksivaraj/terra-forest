// Terra Forest - Database Seed Script
// Run with: npx prisma db seed
// Or: npx tsx prisma/seed.ts

import dotenv from 'dotenv';
dotenv.config({ override: true });

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Terra Forest database...\n');

  // ---- 1. Provinces ----
  console.log('📍 Creating provinces...');
  const dongnai = await prisma.province.upsert({
    where: { code: 'DN' },
    update: {},
    create: {
      code: 'DN',
      name_vi: 'Đồng Nai',
      name_en: 'Dong Nai',
      region: 'southeast',
      total_area_ha: 591400,
      total_plots: 45,
      center_lat: 11.05,
      center_lng: 107.25,
    },
  });

  const binhphuoc = await prisma.province.upsert({
    where: { code: 'BP' },
    update: {},
    create: {
      code: 'BP',
      name_vi: 'Bình Phước',
      name_en: 'Binh Phuoc',
      region: 'southeast',
      total_area_ha: 687100,
      total_plots: 32,
      center_lat: 11.75,
      center_lng: 106.95,
    },
  });

  const daklak = await prisma.province.upsert({
    where: { code: 'DL' },
    update: {},
    create: {
      code: 'DL',
      name_vi: 'Đắk Lắk',
      name_en: 'Dak Lak',
      region: 'central_highlands',
      total_area_ha: 1303100,
      total_plots: 58,
      center_lat: 12.66,
      center_lng: 108.04,
    },
  });

  const lamdong = await prisma.province.upsert({
    where: { code: 'LD' },
    update: {},
    create: {
      code: 'LD',
      name_vi: 'Lâm Đồng',
      name_en: 'Lam Dong',
      region: 'central_highlands',
      total_area_ha: 977100,
      total_plots: 41,
      center_lat: 11.94,
      center_lng: 108.44,
    },
  });

  const camau = await prisma.province.upsert({
    where: { code: 'CM' },
    update: {},
    create: {
      code: 'CM',
      name_vi: 'Cà Mau',
      name_en: 'Ca Mau',
      region: 'mekong_delta',
      total_area_ha: 522100,
      total_plots: 18,
      center_lat: 9.18,
      center_lng: 105.15,
    },
  });

  console.log(`   Created 5 provinces\n`);

  // ---- 2. Organizations ----
  console.log('🏢 Creating organizations...');
  const orgFpd = await prisma.organization.create({
    data: {
      name: 'Forest Protection Department - Dong Nai',
      name_vi: 'Chi cục Kiểm lâm Đồng Nai',
      type: 'government',
      province_id: dongnai.id,
    },
  });

  const orgVnfp = await prisma.organization.create({
    data: {
      name: 'Vietnam Forest Protection Fund',
      name_vi: 'Quỹ Bảo vệ Rừng Việt Nam',
      type: 'government',
    },
  });

  const orgDtu = await prisma.organization.create({
    data: {
      name: 'Dong Nai Technology University',
      name_vi: 'Trường Đại học Công nghệ Đồng Nai',
      type: 'academic',
      province_id: dongnai.id,
    },
  });

  const orgGreenEarth = await prisma.organization.create({
    data: {
      name: 'GreenEarth Consulting',
      name_vi: 'Tư vấn Xanh Đất',
      type: 'ngo',
    },
  });

  const orgCarbonTrade = await prisma.organization.create({
    data: {
      name: 'CarbonTrade VN JSC',
      name_vi: 'Công ty CP Thương mại Carbon VN',
      type: 'private',
      province_id: dongnai.id,
    },
  });

  console.log(`   Created 5 organizations\n`);

  // ---- 3. Roles & Permissions (Spatie) ----
  console.log('🔐 Creating roles & permissions...');
  const roleAdmin = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin', guard_name: 'web' },
  });

  const roleAnalyst = await prisma.role.upsert({
    where: { name: 'analyst' },
    update: {},
    create: { name: 'analyst', guard_name: 'web' },
  });

  const roleGovViewer = await prisma.role.upsert({
    where: { name: 'gov_viewer' },
    update: {},
    create: { name: 'gov_viewer', guard_name: 'web' },
  });

  const roleFieldOfficer = await prisma.role.upsert({
    where: { name: 'field_officer' },
    update: {},
    create: { name: 'field_officer', guard_name: 'web' },
  });

  const permNames = [
    'manage_plots', 'view_plots', 'manage_carbon', 'view_carbon',
    'manage_reports', 'view_reports', 'manage_ai', 'view_ai',
    'manage_users', 'manage_system', 'manage_blockchain',
    'view_blockchain', 'manage_compliance', 'view_compliance',
  ];

  const permissions: any[] = [];
  for (const name of permNames) {
    const perm = await prisma.permission.upsert({
      where: { name },
      update: {},
      create: { name, guard_name: 'web' },
    });
    permissions.push(perm);
  }

  // Assign all permissions to admin
  for (const perm of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        role_id_permission_id: { role_id: roleAdmin.id, permission_id: perm.id },
      },
      update: {},
      create: { role_id: roleAdmin.id, permission_id: perm.id },
    });
  }

  // Analyst: view + manage plots, carbon, reports, ai
  const analystPerms = permissions.filter(p =>
    ['view_plots', 'manage_plots', 'view_carbon', 'manage_carbon',
     'view_reports', 'manage_reports', 'view_ai', 'manage_ai'].includes(p.name)
  );
  for (const perm of analystPerms) {
    await prisma.rolePermission.upsert({
      where: {
        role_id_permission_id: { role_id: roleAnalyst.id, permission_id: perm.id },
      },
      update: {},
      create: { role_id: roleAnalyst.id, permission_id: perm.id },
    });
  }

  // gov_viewer: view only
  const govPerms = permissions.filter(p => p.name.startsWith('view_'));
  for (const perm of govPerms) {
    await prisma.rolePermission.upsert({
      where: {
        role_id_permission_id: { role_id: roleGovViewer.id, permission_id: perm.id },
      },
      update: {},
      create: { role_id: roleGovViewer.id, permission_id: perm.id },
    });
  }

  // field_officer: view + manage plots
  const fieldPerms = permissions.filter(p =>
    ['view_plots', 'manage_plots', 'view_carbon', 'view_compliance'].includes(p.name)
  );
  for (const perm of fieldPerms) {
    await prisma.rolePermission.upsert({
      where: {
        role_id_permission_id: { role_id: roleFieldOfficer.id, permission_id: perm.id },
      },
      update: {},
      create: { role_id: roleFieldOfficer.id, permission_id: perm.id },
    });
  }

  console.log(`   Created 4 roles, ${permNames.length} permissions\n`);

  // ---- 4. Users ----
  console.log('👤 Creating users...');
  const hashedPassword = await hash('password', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@terraforest.vn' },
    update: {},
    create: {
      name: 'Nguyễn Văn Admin',
      email: 'admin@terraforest.vn',
      password: hashedPassword,
      organization_id: orgFpd.id,
      province_id: dongnai.id,
      mfa_enabled: true,
      is_active: true,
    },
  });

  const analystUser = await prisma.user.upsert({
    where: { email: 'analyst@terraforest.vn' },
    update: {},
    create: {
      name: 'Trần Thị Analyst',
      email: 'analyst@terraforest.vn',
      password: hashedPassword,
      organization_id: orgFpd.id,
      province_id: dongnai.id,
      mfa_enabled: false,
      is_active: true,
    },
  });

  const govUser = await prisma.user.upsert({
    where: { email: 'govviewer@terraforest.vn' },
    update: {},
    create: {
      name: 'Lê Minh GovViewer',
      email: 'govviewer@terraforest.vn',
      password: hashedPassword,
      organization_id: orgVnfp.id,
      mfa_enabled: true,
      is_active: true,
    },
  });

  const fieldUser = await prisma.user.upsert({
    where: { email: 'fieldofficer@terraforest.vn' },
    update: {},
    create: {
      name: 'Phạm Văn FieldOfficer',
      email: 'fieldofficer@terraforest.vn',
      password: hashedPassword,
      organization_id: orgFpd.id,
      province_id: dongnai.id,
      mfa_enabled: false,
      is_active: true,
    },
  });

  // Extra demo accounts shown on the login page (admin/ops/lead/ranger/auditor).
  // We map them to the closest existing roles so the login page demo list all works.
  const opsUser = await prisma.user.upsert({
    where: { email: 'ops@terraforest.vn' },
    update: {},
    create: {
      name: 'Ops Manager',
      email: 'ops@terraforest.vn',
      password: hashedPassword,
      organization_id: orgFpd.id,
      province_id: dongnai.id,
      mfa_enabled: false,
      is_active: true,
    },
  });

  const leadUser = await prisma.user.upsert({
    where: { email: 'lead@terraforest.vn' },
    update: {},
    create: {
      name: 'Team Lead',
      email: 'lead@terraforest.vn',
      password: hashedPassword,
      organization_id: orgFpd.id,
      province_id: dongnai.id,
      mfa_enabled: false,
      is_active: true,
    },
  });

  const rangerUser = await prisma.user.upsert({
    where: { email: 'ranger@terraforest.vn' },
    update: {},
    create: {
      name: 'Forest Ranger',
      email: 'ranger@terraforest.vn',
      password: hashedPassword,
      organization_id: orgFpd.id,
      province_id: dongnai.id,
      mfa_enabled: false,
      is_active: true,
    },
  });

  const auditorUser = await prisma.user.upsert({
    where: { email: 'auditor@terraforest.vn' },
    update: {},
    create: {
      name: 'Auditor',
      email: 'auditor@terraforest.vn',
      password: hashedPassword,
      organization_id: orgVnfp.id,
      mfa_enabled: false,
      is_active: true,
    },
  });

  // Assign roles
  await prisma.userRole.upsert({
    where: { user_id_role_id: { user_id: adminUser.id, role_id: roleAdmin.id } },
    update: {},
    create: { user_id: adminUser.id, role_id: roleAdmin.id },
  });
  await prisma.userRole.upsert({
    where: { user_id_role_id: { user_id: analystUser.id, role_id: roleAnalyst.id } },
    update: {},
    create: { user_id: analystUser.id, role_id: roleAnalyst.id },
  });
  await prisma.userRole.upsert({
    where: { user_id_role_id: { user_id: govUser.id, role_id: roleGovViewer.id } },
    update: {},
    create: { user_id: govUser.id, role_id: roleGovViewer.id },
  });
  await prisma.userRole.upsert({
    where: { user_id_role_id: { user_id: fieldUser.id, role_id: roleFieldOfficer.id } },
    update: {},
    create: { user_id: fieldUser.id, role_id: roleFieldOfficer.id },
  });

  // Assign roles for the login-page demo accounts.
  // Map: ops → analyst (closest existing role), lead → field_officer,
  //      ranger → field_officer, auditor → gov_viewer.
  await prisma.userRole.upsert({
    where: { user_id_role_id: { user_id: opsUser.id, role_id: roleAnalyst.id } },
    update: {},
    create: { user_id: opsUser.id, role_id: roleAnalyst.id },
  });
  await prisma.userRole.upsert({
    where: { user_id_role_id: { user_id: leadUser.id, role_id: roleFieldOfficer.id } },
    update: {},
    create: { user_id: leadUser.id, role_id: roleFieldOfficer.id },
  });
  await prisma.userRole.upsert({
    where: { user_id_role_id: { user_id: rangerUser.id, role_id: roleFieldOfficer.id } },
    update: {},
    create: { user_id: rangerUser.id, role_id: roleFieldOfficer.id },
  });
  await prisma.userRole.upsert({
    where: { user_id_role_id: { user_id: auditorUser.id, role_id: roleGovViewer.id } },
    update: {},
    create: { user_id: auditorUser.id, role_id: roleGovViewer.id },
  });

  console.log(`   Created 8 users with roles\n`);

  // ---- 5. Forest Plots ----
  console.log('🌲 Creating forest plots...');
  const plotData = [
    { code: 'DN_BGM_001', type: 'natural', area: 1250.5, lat: 11.52, lng: 107.35, species: 'Dipterocarpus alatus', trees: 28500, risk: 'low', status: 'active' },
    { code: 'DN_BGM_002', type: 'planted', area: 340.2, lat: 11.55, lng: 107.38, species: 'Acacia mangium', trees: 85000, risk: 'low', status: 'active' },
    { code: 'DN_BGM_003', type: 'protection', area: 890.0, lat: 11.48, lng: 107.30, species: 'Hopea odorata', trees: 15000, risk: 'medium', status: 'active' },
    { code: 'DN_CAT_001', type: 'natural', area: 2100.3, lat: 11.20, lng: 107.15, species: 'Shorea siamensis', trees: 42000, risk: 'high', status: 'degraded' },
    { code: 'DN_TB_001', type: 'mangrove', area: 560.8, lat: 10.95, lng: 107.00, species: 'Rhizophora apiculata', trees: 120000, risk: 'medium', status: 'active' },
    { code: 'BP_BP_001', type: 'natural', area: 1800.0, lat: 11.80, lng: 106.90, species: 'Dipterocarpus tuberculatus', trees: 36000, risk: 'low', status: 'active' },
    { code: 'BP_BP_002', type: 'planted', area: 420.5, lat: 11.85, lng: 106.95, species: 'Eucalyptus urophylla', trees: 105000, risk: 'low', status: 'active' },
    { code: 'DL_YT_001', type: 'natural', area: 3200.0, lat: 12.70, lng: 108.10, species: 'Dipterocarpus alatus', trees: 64000, risk: 'critical', status: 'deforested' },
    { code: 'LD_DL_001', type: 'protection', area: 950.0, lat: 11.95, lng: 108.40, species: 'Fokienia hodginsii', trees: 19000, risk: 'low', status: 'active' },
    { code: 'CM_CM_001', type: 'mangrove', area: 780.3, lat: 9.20, lng: 105.20, species: 'Avicennia marina', trees: 156000, risk: 'high', status: 'active' },
  ];

  const plots: any[] = [];
  for (const p of plotData) {
    const provinceId = p.code.startsWith('DN') ? dongnai.id
      : p.code.startsWith('BP') ? binhphuoc.id
      : p.code.startsWith('DL') ? daklak.id
      : p.code.startsWith('LD') ? lamdong.id
      : camau.id;

    const plot = await prisma.forestPlot.upsert({
      where: { plot_code: p.code },
      update: {},
      create: {
        plot_code: p.code,
        province_id: provinceId,
        area_ha: p.area,
        forest_type: p.type,
        status: p.status,
        centroid_lat: p.lat,
        centroid_lng: p.lng,
        fire_risk: p.risk,
        tree_count: p.trees,
        dominant_species: p.species,
        created_by: adminUser.id,
        geometry_json: JSON.stringify({
          type: 'Polygon',
          coordinates: [[[p.lng - 0.01, p.lat - 0.01], [p.lng + 0.01, p.lat - 0.01],
                         [p.lng + 0.01, p.lat + 0.01], [p.lng - 0.01, p.lat + 0.01],
                         [p.lng - 0.01, p.lat - 0.01]]]
        }),
      },
    });
    plots.push(plot);
  }

  console.log(`   Created ${plotData.length} forest plots\n`);

  // ---- 6. Carbon Records ----
  console.log(' Carbon records...');
  const carbonMethods = ['field_measurement', 'remote_sensing', 'ai_estimation'];
  const carbonStatuses = ['verified', 'pending', 'needs_review', 'verified'];

  for (const plot of plots) {
    for (let year = 2020; year <= 2024; year++) {
      const baseStock = plot.area_ha * (plot.forest_type === 'mangrove' ? 180 : plot.forest_type === 'natural' ? 250 : 120);
      const variation = (Math.random() - 0.3) * baseStock * 0.15;
      const method = carbonMethods[Math.floor(Math.random() * carbonMethods.length)];
      const status = carbonStatuses[Math.floor(Math.random() * carbonStatuses.length)];

      await prisma.carbonRecord.create({
        data: {
          plot_id: plot.id,
          year,
          carbon_stock: Math.round((baseStock + variation) * 100) / 100,
          method,
          confidence: method === 'field_measurement' ? 0.95 : method === 'remote_sensing' ? 0.85 : 0.78,
          status,
          verified_by: status === 'verified' ? adminUser.id : null,
          verified_at: status === 'verified' ? new Date(year, 11, 15) : null,
        },
      });
    }
  }
  console.log(`   Created carbon records for 5 years x ${plots.length} plots\n`);

  // ---- 7. Alerts ----
  console.log('🚨 Creating alerts...');
  const alertTypes = ['fire_risk', 'deforestation', 'forest_change', 'ai_detection'];
  const severities = ['critical', 'high', 'medium', 'low'];

  for (let i = 0; i < 15; i++) {
    const plot = plots[Math.floor(Math.random() * plots.length)];
    await prisma.alert.create({
      data: {
        plot_id: plot.id,
        alert_type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        status: i < 5 ? 'active' : i < 10 ? 'acknowledged' : 'resolved',
        message: `Alert detected in plot ${plot.plot_code}`,
        message_vi: `Phát hiện cảnh báo tại lô ${plot.plot_code}`,
        detected_at: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        acknowledged_by: i >= 5 && i < 10 ? adminUser.id : null,
        acknowledged_at: i >= 5 && i < 10 ? new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1) : null,
      },
    });
  }
  console.log(`   Created 15 alerts\n`);

  // ---- 8. AI Assessments ----
  console.log('🤖 Creating AI assessments...');
  const aiModels = [
    { name: 'SAM-Geo', version: 'v2.1' },
    { name: 'DeepForest', version: 'v1.3' },
    { name: 'EfficientNet-B4', version: 'v3.0' },
  ];

  for (const plot of plots.slice(0, 6)) {
    for (const type of ['boundary', 'crown', 'species']) {
      const model = aiModels[Math.floor(Math.random() * aiModels.length)];
      await prisma.plotAiAssessment.create({
        data: {
          plot_id: plot.id,
          assessment_type: type,
          ai_result: JSON.stringify({ detected: true, area_change: -2.3, confidence: 0.87 }),
          confidence: 0.65 + Math.random() * 0.30,
          model_name: model.name,
          model_version: model.version,
          status: Math.random() > 0.5 ? 'approved' : 'needs_human_review',
          reviewed_by: Math.random() > 0.5 ? analystUser.id : null,
          reviewed_at: Math.random() > 0.5 ? new Date() : null,
        },
      });
    }
  }
  console.log(`   Created AI assessments for 6 plots\n`);

  // ---- 9. Reports ----
  console.log('📄 Creating reports...');
  const reportTypes = ['full', 'summary', 'carbon', 'alerts'];
  for (let i = 0; i < 8; i++) {
    await prisma.report.create({
      data: {
        report_type: reportTypes[Math.floor(Math.random() * reportTypes.length)],
        plot_id: i < 5 ? plots[i].id : null,
        status: i < 4 ? 'completed' : i < 6 ? 'processing' : 'queued',
        file_path: i < 4 ? `/reports/report_${Date.now()}_${i}.pdf` : null,
        file_size: i < 4 ? Math.floor(Math.random() * 5000000) + 500000 : null,
        generated_by: adminUser.id,
        date_from: new Date(2024, 0, 1),
        date_to: new Date(2024, 11, 31),
        completed_at: i < 4 ? new Date() : null,
      },
    });
  }
  console.log(`   Created 8 reports\n`);

  // ---- 10. Monitoring Stations ----
  console.log('📡 Creating monitoring stations...');
  const stationData = [
    { name: 'Bu Gia Map Main', name_vi: 'Trạm chính Bu Gia Map', code: 'STN_BGM_01', lat: 11.52, lng: 107.35, type: 'weather' },
    { name: 'Cat Tien Gate', name_vi: 'Cửa vào Cát Tiên', code: 'STN_CAT_01', lat: 11.20, lng: 107.15, type: 'camera' },
    { name: 'Dong Nai River', name_vi: 'Sông Đồng Nai', code: 'STN_DN_01', lat: 10.95, lng: 107.00, type: 'sensor' },
    { name: 'Lac Lake', name_vi: 'Hồ Lắc', code: 'STN_DL_01', lat: 12.70, lng: 108.10, type: 'weather' },
  ];

  for (const s of stationData) {
    const provinceId = s.code.includes('BGM') || s.code.includes('DN') || s.code.includes('CAT')
      ? dongnai.id
      : daklak.id;

    await prisma.monitoringStation.upsert({
      where: { station_code: s.code },
      update: {},
      create: {
        name: s.name,
        name_vi: s.name_vi,
        station_code: s.code,
        province_id: provinceId,
        latitude: s.lat,
        longitude: s.lng,
        elevation_m: Math.floor(Math.random() * 500) + 50,
        station_type: s.type,
        status: 'active',
        last_heartbeat: new Date(),
      },
    });
  }
  console.log(`   Created 4 monitoring stations\n`);

  // ---- 11. Carbon Credits (Blockchain) ----
  console.log('⛓️ Creating carbon credits...');
  const verifiedRecords = await prisma.carbonRecord.findMany({
    where: { status: 'verified' },
    take: 5,
  });

  for (let i = 0; i < verifiedRecords.length; i++) {
    const rec = verifiedRecords[i];
    await prisma.carbonCredit.upsert({
      where: { credit_code: `VNM-${rec.year}-${String(i + 1).padStart(4, '0')}` },
      update: {},
      create: {
        carbon_record_id: rec.id,
        co2e_tonnes: Math.round(rec.carbon_stock * 3.67 * 100) / 100,
        vintage_year: rec.year,
        tx_hash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        credit_code: `VNM-${rec.year}-${String(i + 1).padStart(4, '0')}`,
        status: i < 3 ? 'minted' : i < 4 ? 'verified' : 'retired',
        verified_at: i >= 3 ? new Date() : null,
        retired_at: i >= 4 ? new Date() : null,
      },
    });
  }
  console.log(`   Created ${verifiedRecords.length} carbon credits\n`);

  // ---- 12. Plot Metadata ----
  console.log('📋 Creating plot metadata...');
  for (const plot of plots.slice(0, 5)) {
    await prisma.plotMetadata.upsert({
      where: { plot_id: plot.id },
      update: {},
      create: {
        plot_id: plot.id,
        title: `Forest Plot ${plot.plot_code} - Bu Gia Map National Park`,
        abstract: `Metadata for forest plot ${plot.plot_code} within Bu Gia Map National Park area, Dong Nai Province`,
        purpose: 'Carbon stock monitoring and REDD+ reporting',
        lineage: 'Derived from Sentinel-2 imagery and ground truth surveys',
        contact_organization: 'Forest Protection Department - Dong Nai',
        crs: 'EPSG:3408',
        citation: 'Terra Forest MRV System, 2024',
        data_quality: 'High - validated with field measurements',
        source_imagery: 'Sentinel-2 L2A, 10m resolution',
        update_frequency: 'quarterly',
        completeness_pct: 85 + Math.random() * 14,
        geonetwork_published: Math.random() > 0.5,
      },
    });
  }
  console.log(`   Created metadata for 5 plots\n`);

  console.log('✅ Seeding complete!');
  console.log('\n📋 Summary:');
  console.log('   - 5 provinces');
  console.log('   - 5 organizations');
  console.log('   - 4 roles + 14 permissions');
  console.log('   - 8 users (admin/analyst/gov_viewer/field_officer + ops/lead/ranger/auditor demo)');
  console.log('   - 10 forest plots');
  console.log('   - 50 carbon records (5 years x 10 plots)');
  console.log('   - 15 alerts');
  console.log('   - 18 AI assessments');
  console.log('   - 8 reports');
  console.log('   - 4 monitoring stations');
  console.log('   - Carbon credits & plot metadata');
  console.log('\n🔐 Login credentials (password for all: password):');
  console.log('   admin@terraforest.vn        (role: admin)');
  console.log('   analyst@terraforest.vn      (role: analyst)');
  console.log('   govviewer@terraforest.vn    (role: gov_viewer)');
  console.log('   fieldofficer@terraforest.vn (role: field_officer)');
  console.log('   ops@terraforest.vn          (role: analyst — login page demo)');
  console.log('   lead@terraforest.vn         (role: field_officer — login page demo)');
  console.log('   ranger@terraforest.vn       (role: field_officer — login page demo)');
  console.log('   auditor@terraforest.vn      (role: gov_viewer — login page demo)');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
