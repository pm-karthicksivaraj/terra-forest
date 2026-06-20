// Terra Forest — Shared Constants (Bilingual: EN + VI)

// ─── Navigation ─────────────────────────────────────────────────
export const NAV_SECTIONS = [
  {
    label: 'Dashboard',
    labelVi: 'Bảng điều khiển',
    items: [
      { href: '/', label: 'Overview', labelVi: 'Tổng quan', icon: 'LayoutDashboard' },
      { href: '/live-ops', label: 'Live Operations', labelVi: 'Hoạt động trực tuyến', icon: 'Radio' },
    ],
  },
  {
    label: 'Forest Monitoring',
    labelVi: 'Giám sát rừng',
    items: [
      { href: '/map', label: 'Map', labelVi: 'Bản đồ', icon: 'Map' },
      { href: '/ndvi', label: 'NDVI', labelVi: 'NDVI', icon: 'SatelliteDish' },
      { href: '/slms', label: 'Satellite Monitoring', labelVi: 'Giám sát vệ tinh', icon: 'Globe2' },
    ],
  },
  {
    label: 'Field Operations',
    labelVi: 'Hoạt động hiện trường',
    items: [
      { href: '/patrols', label: 'Patrol & Rangers', labelVi: 'Tuần tra & Kiểm lâm', icon: 'Footprints' },
      { href: '/alerts', label: 'Alerts & Incidents', labelVi: 'Cảnh báo & Sự cố', icon: 'AlertTriangle' },
      { href: '/biodiversity', label: 'Biodiversity Surveys', labelVi: 'Khảo sát sinh thái', icon: 'Leaf' },
    ],
  },
  {
    label: 'Forest Inventory',
    labelVi: 'Kiểm kê rừng',
    items: [
      { href: '/nfi', label: 'NFI Field Plots', labelVi: 'Ô tiêu chuẩn NFI', icon: 'TreePine' },
      { href: '/biomass', label: 'Biomass & Carbon Stock', labelVi: 'Sinh khối & Cổ Cacbon', icon: 'Scale' },
    ],
  },
  {
    label: 'REDD+ / dMRV',
    labelVi: 'REDD+ / dMRV',
    items: [
      { href: '/nfms', label: 'NFMS Setup', labelVi: 'Thiết lập NFMS', icon: 'Database' },
      { href: '/frel', label: 'FREL / FRL', labelVi: 'FREL / FRL', icon: 'TrendingDown' },
      { href: '/ghg', label: 'GHG Inventory', labelVi: 'Kiểm kê GHG', icon: 'CloudCog' },
      { href: '/redd-results', label: 'REDD+ Results', labelVi: 'Kết quả REDD+', icon: 'Award' },
      { href: '/verification', label: 'Verification & Audit', labelVi: 'Xác minh & Kiểm toán', icon: 'ShieldCheck' },
    ],
  },
  {
    label: 'Fire & Climate',
    labelVi: 'Cháy rừng & Khí hậu',
    items: [
      { href: '/fire-weather', label: 'Fire & Weather', labelVi: 'Thời tiết & Cháy rừng', icon: 'Flame' },
    ],
  },
  {
    label: 'Compliance',
    labelVi: 'Tuân thủ',
    items: [
      { href: '/traceability', label: 'Timber Traceability', labelVi: 'Truy xuất nguồn gốc gỗ', icon: 'QrCode' },
    ],
  },
  {
    label: 'Users & Teams',
    labelVi: 'Người dùng & Đội',
    items: [
      { href: '/users', label: 'User Management', labelVi: 'Quản lý người dùng', icon: 'Users' },
      { href: '/roles', label: 'Roles & Permissions', labelVi: 'Vai trò & Quyền', icon: 'Key' },
      { href: '/teams', label: 'Ranger Teams', labelVi: 'Đội kiểm lâm', icon: 'UsersRound' },
      { href: '/devices', label: 'Devices', labelVi: 'Thiết bị', icon: 'Smartphone' },
      { href: '/tasks', label: 'Task Management', labelVi: 'Quản lý nhiệm vụ', icon: 'ListTodo' },
      { href: '/evidence', label: 'Evidence Review', labelVi: 'Xem xét bằng chứng', icon: 'Camera' },
      { href: '/ota', label: 'OTA Releases', labelVi: 'Phát hành OTA', icon: 'Upload' },
    ],
  },
  {
    label: 'Reports',
    labelVi: 'Báo cáo',
    items: [
      { href: '/reports', label: 'Reports', labelVi: 'Báo cáo', icon: 'FileText' },
    ],
  },
  {
    label: 'System',
    labelVi: 'Hệ thống',
    items: [
      { href: '/settings', label: 'Settings', labelVi: 'Cài đặt', icon: 'Settings' },
    ],
  },
] as const;

// Flat list for backward compatibility
export const NAV_ITEMS: { href: string; label: string; labelVi: string; icon: string }[] = NAV_SECTIONS.flatMap(s => [...s.items]);

// ─── Forest Types ───────────────────────────────────────────────
export const FOREST_TYPES = [
  { value: 'natural', label: 'Natural Forest', labelVi: 'Rừng tự nhiên', color: '#2D6A4F' },
  { value: 'planted', label: 'Planted Forest', labelVi: 'Rừng trồng', color: '#52B788' },
  { value: 'protection', label: 'Protection Forest', labelVi: 'Rừng phòng hộ', color: '#40916C' },
  { value: 'mangrove', label: 'Mangrove Forest', labelVi: 'Rừng ngập mặn', color: '#0277BD' },
] as const;

// ─── Alert Types ────────────────────────────────────────────────
export const ALERT_TYPES = [
  { value: 'fire_risk', label: 'Fire Risk', labelVi: 'Nguy cơ cháy', icon: 'Flame', color: '#E65100' },
  { value: 'deforestation', label: 'Deforestation', labelVi: 'Phá rừng', icon: 'TreePine', color: '#D32F2F' },
  { value: 'forest_change', label: 'Forest Change', labelVi: 'Thay đổi rừng', icon: 'GitCompare', color: '#FF8A65' },
  { value: 'disease', label: 'Disease', labelVi: 'Bệnh', icon: 'Bug', color: '#795548' },
  { value: 'ai_detection', label: 'AI Detection', labelVi: 'Phát hiện AI', icon: 'Brain', color: '#2D6A4F' },
] as const;

export const ALERT_SEVERITY = [
  { value: 'critical', label: 'Critical', labelVi: 'Nghiêm trọng', color: '#D32F2F', bg: '#FFEBEE' },
  { value: 'high', label: 'High', labelVi: 'Cao', color: '#E65100', bg: '#FFF3E0' },
  { value: 'medium', label: 'Medium', labelVi: 'Trung bình', color: '#FF8A65', bg: '#FFF8E1' },
  { value: 'low', label: 'Low', labelVi: 'Thấp', color: '#2D6A4F', bg: '#E8F5E9' },
] as const;

export const ALERT_STATUSES = [
  { value: 'new', label: 'New', labelVi: 'Mới', color: '#D32F2F' },
  { value: 'acknowledged', label: 'Acknowledged', labelVi: 'Đã xác nhận', color: '#E65100' },
  { value: 'in_field', label: 'In Field', labelVi: 'Đang hiện trường', color: '#0277BD' },
  { value: 'resolved', label: 'Resolved', labelVi: 'Đã giải quyết', color: '#2D6A4F' },
] as const;

// ─── Plot Status ────────────────────────────────────────────────
export const PLOT_STATUS = [
  { value: 'active', label: 'Active', labelVi: 'Đang hoạt động', color: '#2D6A4F' },
  { value: 'degraded', label: 'Degraded', labelVi: 'Suy thoái', color: '#FF8A65' },
  { value: 'deforested', label: 'Deforested', labelVi: 'Đã phá rừng', color: '#D32F2F' },
  { value: 'pending', label: 'Pending', labelVi: 'Đang chờ', color: '#795548' },
] as const;

// ─── Fire Risk Levels ──────────────────────────────────────────
export const FIRE_RISK_LEVELS = [
  { value: 'low', label: 'Low', labelVi: 'Thấp', color: '#52B788', percent: 25 },
  { value: 'medium', label: 'Medium', labelVi: 'Trung bình', color: '#FFD600', percent: 50 },
  { value: 'high', label: 'High', labelVi: 'Cao', color: '#FF8A65', percent: 75 },
  { value: 'critical', label: 'Critical', labelVi: 'Nghiêm trọng', color: '#E65100', percent: 100 },
] as const;

// ─── Tree Species ───────────────────────────────────────────────
export const TREE_SPECIES = [
  { name: 'Dipterocarpus alatus', nameVi: 'Dau song ne', nameEn: 'Resin Dipterocarp', type: 'natural' },
  { name: 'Shorea siamensis', nameVi: 'Cam liet', nameEn: 'Siamese Sal', type: 'natural' },
  { name: 'Hopea odorata', nameVi: 'Sao den', nameEn: 'White Meranti', type: 'natural' },
  { name: 'Dipterocarpus tuberculatus', nameVi: 'Dau la Pom', nameEn: 'Mountain Dipterocarp', type: 'natural' },
  { name: 'Fokienia hodginsii', nameVi: 'Po mu', nameEn: 'Fujian Cypress', type: 'protection' },
  { name: 'Acacia mangium', nameVi: 'Keo tai tuong', nameEn: 'Brown Salwood', type: 'planted' },
  { name: 'Eucalyptus urophylla', nameVi: 'Bach dan urophylla', nameEn: 'Timor Mountain Gum', type: 'planted' },
  { name: 'Rhizophora apiculata', nameVi: 'Do vet', nameEn: 'Stilt Mangrove', type: 'mangrove' },
  { name: 'Avicennia marina', nameVi: 'Mam trang', nameEn: 'Grey Mangrove', type: 'mangrove' },
  { name: 'Tectona grandis', nameVi: 'Teak', nameEn: 'Teak', type: 'planted' },
  { name: 'Chukrasia tabularis', nameVi: 'Lat hoa', nameEn: 'Indian Mahogany', type: 'natural' },
  { name: 'Tarrietia javanica', nameVi: 'Ven ven', nameEn: 'Java Almond', type: 'natural' },
] as const;

// ─── Animal Species ─────────────────────────────────────────────
export const ANIMAL_SPECIES = [
  { name: 'Panthera tigris', nameVi: 'Ho', nameEn: 'Indochinese Tiger', status: 'EN' },
  { name: 'Elephas maximus', nameVi: 'Voi chau A', nameEn: 'Asian Elephant', status: 'EN' },
  { name: 'Pygathrix nigripes', nameVi: 'Vooc cha va chan nau', nameEn: 'Black-shanked Douc', status: 'CR' },
  { name: 'Hylobates gabriellae', nameVi: 'Vuong vang ma', nameEn: 'Buff-cheeked Gibbon', status: 'EN' },
  { name: 'Crocodylus siamensis', nameVi: 'Ca sau hoa', nameEn: 'Siamese Crocodile', status: 'CR' },
  { name: 'Pseudoryx nghetinhensis', nameVi: 'Saola', nameEn: 'Saola', status: 'CR' },
] as const;

// ─── Medicinal Plants ───────────────────────────────────────────
export const MEDICINAL_PLANTS = [
  { name: 'Panax vietnamensis', nameVi: 'Sam Viet Nam', nameEn: 'Vietnamese Ginseng', status: 'VU' },
  { name: 'Amomum longiligulare', nameVi: 'Sa nhan', nameEn: 'Cardamom', status: 'LC' },
  { name: 'Alpinia oxyphylla', nameEn: 'Sharp-leaved Galangal', status: 'LC' },
  { name: 'Cinnamomum cassia', nameVi: 'Que', nameEn: 'Cassia Cinnamon', status: 'LC' },
  { name: 'Morinda citrifolia', nameVi: 'Nhau', nameEn: 'Noni', status: 'LC' },
] as const;

// ─── Water Sources ──────────────────────────────────────────────
export const WATER_SOURCES = [
  { name: 'Dong Nai River', type: 'river', length: 586 },
  { name: 'Tri An Reservoir', type: 'lake', area: 323 },
  { name: 'Bu Gia Map Stream', type: 'stream', length: 45 },
  { name: 'La Nga River', type: 'river', length: 165 },
] as const;

// ─── Provinces ──────────────────────────────────────────────────
export const PROVINCES = [
  { code: 'DN', name: 'Dong Nai', region: 'Southeast' },
  { code: 'BP', name: 'Binh Phuoc', region: 'Southeast' },
  { code: 'DL', name: 'Dak Lak', region: 'Central Highlands' },
  { code: 'LD', name: 'Lam Dong', region: 'Central Highlands' },
  { code: 'CM', name: 'Ca Mau', region: 'Mekong Delta' },
] as const;

// ─── NDVI ───────────────────────────────────────────────────────
export const NDVI_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
] as const;

export const NDVI_MONTHS_VI = [
  'T1', 'T2', 'T3', 'T4', 'T5', 'T6',
  'T7', 'T8', 'T9', 'T10', 'T11', 'T12'
] as const;

// ─── Conservation Status ────────────────────────────────────────
export const CONSERVATION_STATUS_MAP: Record<string, { label: string; labelVi: string; color: string }> = {
  CR: { label: 'Critically Endangered', labelVi: 'Nguy cấp cực kỳ', color: '#D32F2F' },
  EN: { label: 'Endangered', labelVi: 'Nguy cấp', color: '#E65100' },
  VU: { label: 'Vulnerable', labelVi: 'Dễ tổn thương', color: '#FF8A65' },
  NT: { label: 'Near Threatened', labelVi: 'Sắp nguy cấp', color: '#FFD600' },
  LC: { label: 'Least Concern', labelVi: 'Ít quan tâm', color: '#52B788' },
};

// ─── Carbon Methods ─────────────────────────────────────────────
export const CARBON_METHODS = [
  { value: 'field_measurement', label: 'Field Measurement', labelVi: 'Đo lường hiện trường' },
  { value: 'remote_sensing', label: 'Remote Sensing', labelVi: 'Khảo sát từ xa' },
  { value: 'ai_estimation', label: 'AI Estimation', labelVi: 'Ước tính AI' },
] as const;

// ─── Timber Status ──────────────────────────────────────────────
export const TIMBER_STATUS_MAP: Record<string, { label: string; labelVi: string; color: string }> = {
  pending: { label: 'Pending Verification', labelVi: 'Đang chờ xác minh', color: '#795548' },
  verified: { label: 'Verified', labelVi: 'Đã xác minh', color: '#2D6A4F' },
  rejected: { label: 'Rejected', labelVi: 'Đã từ chối', color: '#D32F2F' },
  in_transit: { label: 'In Transit', labelVi: 'Đang vận chuyển', color: '#0277BD' },
  delivered: { label: 'Delivered', labelVi: 'Đã giao', color: '#52B788' },
};

// ─── Roles ──────────────────────────────────────────────────────
export const ROLES = [
  { value: 'system_admin', label: 'System Admin', labelVi: 'Quản trị viên hệ thống', description: 'Full platform access, user management, device management, OTA releases, system configuration', descriptionVi: 'Toàn quyền truy cập nền tảng, quản lý người dùng, quản lý thiết bị, phát hành OTA, cấu hình hệ thống' },
  { value: 'operations_manager', label: 'Operations Manager', labelVi: 'Quản lý vận hành', description: 'Create teams, assign tasks, monitor live sessions, review evidence, approve closures', descriptionVi: 'Tạo đội, giao nhiệm vụ, giám sát phiên trực tuyến, xem xét bằng chứng, phê duyệt đóng' },
  { value: 'team_lead', label: 'Team Lead', labelVi: 'Trưởng đội', description: 'Start team patrols, confirm attendance, assign field subtasks, validate submissions', descriptionVi: 'Bắt đầu tuần tra đội, xác nhận tham gia, giao nhiệm vụ phụ hiện trường, xác nhận gửi' },
  { value: 'ranger', label: 'Forest Ranger', labelVi: 'Kiểm lâm', description: 'Use mobile app for check-in, task navigation, photo/video/voice capture, submit observations', descriptionVi: 'Sử dụng ứng dụng di động để check-in, điều hướng nhiệm vụ, chụp ảnh/quay video/ghi âm, gửi quan sát' },
  { value: 'auditor', label: 'Auditor / Verifier', labelVi: 'Kiểm toán / Xác minh', description: 'Review evidence history, media metadata, timestamps, route logs, task completion trails', descriptionVi: 'Xem xét lịch sử bằng chứng, siêu dữ liệu phương tiện, dấu thời gian, nhật ký tuyến đường, vết hoàn thành nhiệm vụ' },
] as const;

// ─── Task Types ─────────────────────────────────────────────────
export const TASK_TYPES = [
  { value: 'patrol', label: 'Patrol', labelVi: 'Tuần tra', icon: 'Footprints' },
  { value: 'observation', label: 'Observation', labelVi: 'Quan sát', icon: 'Eye' },
  { value: 'fire_check', label: 'Fire Check', labelVi: 'Kiểm tra cháy', icon: 'Flame' },
  { value: 'boundary_survey', label: 'Boundary Survey', labelVi: 'Khảo sát ranh giới', icon: 'MapPin' },
  { value: 'species_count', label: 'Species Count', labelVi: 'Đếm loài', icon: 'Leaf' },
  { value: 'evidence_collection', label: 'Evidence Collection', labelVi: 'Thu thập bằng chứng', icon: 'Camera' },
  { value: 'other', label: 'Other', labelVi: 'Khác', icon: 'MoreHorizontal' },
] as const;

export const TASK_PRIORITIES = [
  { value: 'low', label: 'Low', labelVi: 'Thấp', color: '#52B788' },
  { value: 'medium', label: 'Medium', labelVi: 'Trung bình', color: '#FFD600' },
  { value: 'high', label: 'High', labelVi: 'Cao', color: '#FF8A65' },
  { value: 'critical', label: 'Critical', labelVi: 'Nghiêm trọng', color: '#D32F2F' },
] as const;

export const TASK_STATUSES = [
  { value: 'assigned', label: 'Assigned', labelVi: 'Đã giao', color: '#0277BD' },
  { value: 'in_progress', label: 'In Progress', labelVi: 'Đang thực hiện', color: '#E65100' },
  { value: 'completed', label: 'Completed', labelVi: 'Hoàn thành', color: '#2D6A4F' },
  { value: 'verified', label: 'Verified', labelVi: 'Đã xác minh', color: '#40916C' },
  { value: 'failed', label: 'Failed', labelVi: 'Không thành công', color: '#D32F2F' },
  { value: 'cancelled', label: 'Cancelled', labelVi: 'Đã hủy', color: '#795548' },
] as const;

// ─── Device Statuses ────────────────────────────────────────────
export const DEVICE_STATUSES = [
  { value: 'active', label: 'Active', labelVi: 'Đang hoạt động', color: '#2D6A4F' },
  { value: 'disabled', label: 'Disabled', labelVi: 'Đã vô hiệu hóa', color: '#795548' },
  { value: 'lost', label: 'Lost', labelVi: 'Đã mất', color: '#D32F2F' },
  { value: 'retired', label: 'Retired', labelVi: 'Đã nghỉ', color: '#9E9E9E' },
] as const;

// ─── Team Statuses ──────────────────────────────────────────────
export const TEAM_STATUSES = [
  { value: 'active', label: 'Active', labelVi: 'Đang hoạt động', color: '#2D6A4F' },
  { value: 'standby', label: 'Standby', labelVi: 'Dự bị', color: '#FFD600' },
  { value: 'disbanded', label: 'Disbanded', labelVi: 'Đã giải tán', color: '#9E9E9E' },
] as const;

// ─── Evidence Types ─────────────────────────────────────────────
export const EVIDENCE_TYPES = [
  { value: 'photo', label: 'Photo', labelVi: 'Ảnh', icon: 'Camera' },
  { value: 'video', label: 'Video', labelVi: 'Video', icon: 'Video' },
  { value: 'voice_note', label: 'Voice Note', labelVi: 'Ghi âm', icon: 'Mic' },
  { value: 'document', label: 'Document', labelVi: 'Tài liệu', icon: 'FileText' },
  { value: 'gps_track', label: 'GPS Track', labelVi: 'Dữ liệu GPS', icon: 'MapPin' },
] as const;

// ─── OTA Statuses ───────────────────────────────────────────────
export const OTA_STATUSES = [
  { value: 'draft', label: 'Draft', labelVi: 'Nháp', color: '#795548' },
  { value: 'testing', label: 'Testing', labelVi: 'Đang thử nghiệm', color: '#0277BD' },
  { value: 'rolling_out', label: 'Rolling Out', labelVi: 'Đang triển khai', color: '#E65100' },
  { value: 'released', label: 'Released', labelVi: 'Đã phát hành', color: '#2D6A4F' },
  { value: 'revoked', label: 'Revoked', labelVi: 'Đã thu hồi', color: '#D32F2F' },
] as const;

// ─── GHG Tiers ─────────────────────────────────────────────────
export const GHG_TIERS = [
  { value: 'tier1', label: 'Tier 1 — IPCC Default', labelVi: 'Cấp 1 — Mặc định IPCC', description: 'Uses IPCC default emission factors and globally averaged data', descriptionVi: 'Sử dụng hệ số phát triển mặc định IPCC và dữ liệu trung bình toàn cầu' },
  { value: 'tier2', label: 'Tier 2 — Country-Specific', labelVi: 'Cấp 2 — Dành riêng cho quốc gia', description: 'Uses country-specific emission factors and national data', descriptionVi: 'Sử dụng hệ số phát triển dành riêng cho quốc gia và dữ liệu quốc gia' },
  { value: 'tier3', label: 'Tier 3 — High Resolution', labelVi: 'Cấp 3 — Độ phân giải cao', description: 'Uses high-resolution activity data, models, and measurement-based approaches', descriptionVi: 'Sử dụng dữ liệu hoạt động độ phân giải cao, mô hình và phương pháp dựa trên đo lường' },
] as const;

// ─── REDD+ Activity Types ───────────────────────────────────────
export const REDD_ACTIVITY_TYPES = [
  { value: 'reduced_deforestation', label: 'Reduced Deforestation', labelVi: 'Giảm phá rừng', color: '#D32F2F' },
  { value: 'reduced_degradation', label: 'Reduced Degradation', labelVi: 'Giảm suy thoái', color: '#FF8A65' },
  { value: 'conservation', label: 'Conservation', labelVi: 'Bảo tồn', color: '#2D6A4F' },
  { value: 'sustainable_management', label: 'Sustainable Management', labelVi: 'Quản lý bền vững', color: '#40916C' },
  { value: 'carbon_enhancement', label: 'Carbon Stock Enhancement', labelVi: 'Tăng cường cổng cacbon', color: '#52B788' },
] as const;
