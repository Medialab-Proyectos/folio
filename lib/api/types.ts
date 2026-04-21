// ─── Auth ────────────────────────────────────────────────────────────────────

export interface UserLogin {
  email: string;
  password: string;
}

export interface TokenWithRefresh {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AccessToken {
  access_token: string;
  token_type: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface LogoutRequest {
  refresh_token: string;
}

export interface ChangePasswordRequest {
  password: string;
}

export interface GoogleValidateRequest {
  id_token: string;
  name?: string;
}

export interface AppleValidateRequest {
  identity_token: string;
  name?: string;
}

// ─── OTP ─────────────────────────────────────────────────────────────────────

export interface GenerateOTPRequest {
  email: string;
  is_develop?: boolean;
}

export interface ValidateOTPRequest {
  email: string;
  otp: string;
  is_develop?: boolean;
}

export interface OTPChangePasswordRequest {
  email: string;
  password: string;
  otp: string;
  is_develop?: boolean;
}

// ─── Users ───────────────────────────────────────────────────────────────────

/** Used for POST /auth/register — additionalProperties: false, no role_id */
export interface RegisterUserCreate {
  email: string;
  password: string;
  apple_uuid?: string;
  birthday?: string;
  gmail_uuid?: string;
  name?: string;
  notification_email?: boolean;
  notification_event?: boolean;
  phone?: string;
  place?: string;
  type?: 'admin' | 'user' | 'adminuser';
  billing?: string;
}

/** Used for POST /users/ (admin create) — allows role_id */
export interface UserCreate {
  email: string;
  password: string;
  apple_uuid?: string;
  birthday?: string;
  gmail_uuid?: string;
  name?: string;
  notification_email?: boolean;
  notification_event?: boolean;
  phone?: string;
  place?: string;
  type?: string;
  billing?: string;
  role_id?: string;
}

export interface UserRead {
  id: string;
  email: string;
  apple_uuid?: string;
  birthday?: string;
  gmail_uuid?: string;
  name?: string;
  notification_email?: boolean;
  notification_event?: boolean;
  phone?: string;
  place?: string;
  type?: string;
  billing?: string;
  role_id?: string;
}

export interface UserUpdate {
  apple_uuid?: string;
  birthday?: string;
  email?: string;
  gmail_uuid?: string;
  name?: string;
  notification_email?: boolean;
  notification_event?: boolean;
  phone?: string;
  place?: string;
  type?: string;
  billing?: string;
  role_id?: string;
}

export interface PaginatedUsers {
  items: UserRead[];
  total: number;
}

export interface UserListParams {
  page?: number;
  items?: number;
  apple_uuid?: string;
  birthday?: string;
  email?: string;
  gmail_uuid?: string;
  name?: string;
  notification_email?: boolean;
  notification_event?: boolean;
  phone?: string;
  place?: string;
  type?: string;
}

// ─── Cars ────────────────────────────────────────────────────────────────────

export interface CarCreate {
  make: string;
  model: string;
  plate: string;
  year: number;
  user_id: string;
  facility_id: string;
  staff_user_id: string;
  nickname?: string;
  color?: string;
  current_milage?: string;
  vin?: string;
  vin_number?: string;
  location?: string;
  odometer?: number;
  notes?: number;
  voice?: number;
  registration_date?: string;
  insurance_date?: string;
  performed?: number;
  car_status?: number;
}

export interface CarRead {
  id: string;
  make: string;
  model: string;
  plate: string;
  year: number;
  color?: string;
  nickname?: string;
  current_milage?: string;
  vin?: string;
  vin_number?: string;
  location?: string;
  odometer?: number;
  notes?: number;
  voice?: number;
  registration_date?: string;
  insurance_date?: string;
  performed?: number;
  car_status?: number;
  user_id?: string;
  facility_id?: string;
  staff_user_id?: string;
}

export interface CarUpdate {
  nickname?: string;
  make?: string;
  model?: string;
  plate?: string;
  color?: string;
  year?: number;
  current_milage?: number;
  vin?: string;
  vin_number?: string;
  location?: string;
  odometer?: number;
  notes?: number;
  voice?: number;
  registration_date?: string;
  insurance_date?: string;
  performed?: string;
  user_id?: string;
  facility_id?: string;
  staff_user_id?: string;
}

export interface PaginatedCars {
  items: CarRead[];
  total: number;
}

export interface CarListParams {
  page?: number;
  items?: number;
  plate?: string;
  nickname?: string;
  make?: string;
  model?: string;
  year?: number;
  vin?: string;
}

export interface CarReadWithFileUrl extends CarRead {
  file_url?: string;
  recordCount?: number;
}

export interface PaginationInfo {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedDataResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

export interface CarPhotoCreate {
  car_id: string;
  url: string;
  order?: number;
}

export interface CarPhotoRead extends CarPhotoCreate {
  id: string;
}

export interface CarPhotoUpdate {
  url?: string;
  order?: number;
}

// ─── Companies ───────────────────────────────────────────────────────────────

export interface CompanyCreate {
  company_name: string;
  company_address?: string;
  company_phone?: string;
  company_status?: number;
}

export interface CompanyRead extends CompanyCreate {
  id: string;
}

export interface CompanyUpdate {
  company_name?: string;
  company_address?: string;
  company_phone?: string;
  company_status?: number;
}

export interface CompanyListParams {
  skip?: number;
  limit?: number;
  only_active?: boolean;
}

// ─── Facilities ──────────────────────────────────────────────────────────────

export interface FacilityCreate {
  facility_name: string;
  company_id: string;
  facility_location?: string;
  facility_address?: string;
  facility_phone?: string;
  facility_status?: number;
  facility_web?: string;
}

export interface FacilityRead extends FacilityCreate {
  id: string;
}

export interface FacilityUpdate {
  facility_name?: string;
  company_id?: string;
  facility_location?: string;
  facility_address?: string;
  facility_phone?: string;
  facility_status?: number;
  facility_web?: string;
}

export interface FacilityListParams {
  skip?: number;
  limit?: number;
  only_active?: boolean;
  company_id?: string;
}

// ─── Projects ────────────────────────────────────────────────────────────────

export interface ProjectCreate {
  project_name: string;
  card_id?: string;
  project_type_id?: string;
  project_status_id?: string;
  project_start_date?: string;
  project_cost?: number;
  project_location?: string;
  project_obs?: string;
}

export interface ProjectRead extends ProjectCreate {
  id: string;
}

export interface ProjectUpdate {
  project_name?: string;
  card_id?: string;
  project_type_id?: string;
  project_status_id?: string;
  project_start_date?: string;
  project_cost?: number;
  project_location?: string;
  project_obs?: string;
}

export interface PaginatedProjects {
  items: ProjectRead[];
  total: number;
}

export interface ProjectListParams {
  page?: number;
  items?: number;
  car_id?: string;
  project_type_id?: string;
  project_status_id?: string;
  project_name?: string;
  project_location?: string;
}

// ─── Roles ───────────────────────────────────────────────────────────────────

export interface RoleCreate {
  role_name: string;
  role_status?: number;
}

export interface RoleRead extends RoleCreate {
  id: string;
}

export interface RoleUpdate {
  role_name?: string;
  role_status?: number;
}

export interface RoleListParams {
  skip?: number;
  limit?: number;
}

// ─── Permissions ─────────────────────────────────────────────────────────────

export interface PermissionCreate {
  role_id: string;
  cmetadata?: Record<string, unknown>;
}

export interface PermissionRead extends PermissionCreate {
  id: string;
}

export interface PermissionUpdate {
  role_id?: string;
  cmetadata?: Record<string, unknown>;
}

export interface PermissionListParams {
  skip?: number;
  limit?: number;
}

// ─── Subscription ─────────────────────────────────────────────────────────────

export interface SubscriptionRead {
  id: string;
  user_id: string;
  provider: string;
  provider_subscription_id: string;
  provider_customer_id: string;
  provider_price_id: string;
  status: string;
  cancel_at_period_end: boolean;
  current_period_start?: string;
  current_period_end?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

// ─── AI Card ─────────────────────────────────────────────────────────────────

export interface AICardBasicResponse {
  plate?: string;
  brand?: string;
  model?: string;
  color?: string;
  year?: string;
}

export interface AICardDetailResponse {
  success?: boolean;
  is_car?: boolean;
  make?: string;
  model?: string;
  year?: string;
  color?: string;
  license_plate?: string;
  body_type?: string;
  viewpoint?: string;
  vehicle_bbox?: unknown;
  plate_bbox?: unknown;
  confidence?: number;
  scene?: string;
  message?: string;
  usage?: unknown;
}

// ─── Document ────────────────────────────────────────────────────────────────

export type DocumentAnalysisResponse = Record<string, unknown>;

// ─── Voice ───────────────────────────────────────────────────────────────────

export interface VoiceRequest {
  voice: string;
}

export interface VoiceResponse {
  title?: string;
  cost?: number;
  date?: string;
  description?: string;
  notes?: string;
  raw?: Record<string, unknown>;
}

// ─── Survey Cars ─────────────────────────────────────────────────────────────

export interface SurveyCarCreate {
  car_id: string;
  view_position: string;
  survey_car_status?: number;
  image?: File;
}

export interface SurveyCarRead {
  id: string;
  car_id: string;
  view_position?: string;
  image?: string;
  origin_name?: string;
  file_path?: string;
  extention?: string;
  file_url?: string;
  survey_car_status: number;
}

export interface SurveyCarUpdate {
  view_position?: string;
  survey_car_status?: number;
  image?: File;
}

export interface SurveyCarListParams {
  car_id?: string;
}

// ─── Records ─────────────────────────────────────────────────────────────────

export interface RecordCreate {
  project_id: string;
  title: string;
  date: string;
  cost: number;
  description: string;
  notes?: string;
  record_status?: number;
  files?: File[];
  file?: File;
}

export interface RecordRead {
  id: string;
  project_id: string;
  title: string;
  date: string;
  cost: number;
  description: string;
  notes?: string;
  record_status: number;
}

export interface RecordUpdate {
  project_id?: string;
  title?: string;
  date?: string;
  cost?: number;
  description?: string;
  notes?: string;
  record_status?: number;
}

export interface RecordListParams {
  project_id?: string;
}

// ─── Record Files ─────────────────────────────────────────────────────────────

export interface RecordFilesRead {
  id: string;
  project_id: string;
  record_id: string;
  record_file: string;
  record_origin_name?: string;
  record_extention?: string;
  record_file_path?: string;
  record_file_status: number;
  created: string;
  updated: string;
}

export interface RecordFilesListIn {
  project_id?: string;
  record_id?: string;
}

export interface RecordFilesDeleteIn {
  project_id: string;
  record_id: string;
}

// ─── Garage Search ────────────────────────────────────────────────────────────

export interface GarageSearchCarUserRead {
  image?: string;
}

export interface GarageSearchCarItem {
  nickname?: string;
  make: string;
  model: string;
  year: number;
  current_milage?: string;
  registration_date?: string;
  insurance_date?: string;
  records_total: number;
  car_user?: GarageSearchCarUserRead;
}

export interface GarageSearchProjectRecords {
  [key: string]: unknown;
}

export interface GarageSearchProjectItem {
  id: string;
  card_id?: string;
  project_name: string;
  project_start_date?: string;
  project_cost?: number;
  project_location?: string;
  project_obs?: string;
  project_status: number;
  project_type_name?: string;
  project_status_name?: string;
  extra: GarageSearchProjectRecords;
}

export interface PaginatedGarageSearchCars {
  items: GarageSearchCarItem[];
  total: number;
}

export interface PaginatedGarageSearchProjects {
  items: GarageSearchProjectItem[];
  total: number;
}

export interface GarageSearchCarsParams {
  page?: number;
  items?: number;
  search?: string;
}

export interface GarageSearchProjectsParams {
  page?: number;
  items?: number;
  card_id?: string;
  search?: string;
}

// ─── User Cars ────────────────────────────────────────────────────────────────

export interface UserCarRead {
  id: string;
  user_id: string;
  car_id: string;
  status_car: number;
  image?: string;
  origin_name?: string;
  extention?: string;
  type?: string;
  position?: string;
}

export interface UserCarCreate {
  user_id: string;
  car_id: string;
  status_car?: number;
  type?: string;
  position?: string;
  image?: File;
}

export interface UserCarUpdate {
  status_car?: number;
  type?: string;
  position?: string;
  image?: File;
}

// ─── Car Facilities ───────────────────────────────────────────────────────────

export interface CarFacilityRead {
  id: string;
  car_id: string;
  facility_id: string;
  status: number;
}

export interface CarFacilityCreate {
  car_id: string;
  facility_id: string;
  status?: number;
}

export interface CarFacilityUpdate {
  car_id?: string;
  facility_id?: string;
  status?: number;
}

export interface CarFacilityListParams {
  car_id?: string;
  facility_id?: string;
  status?: number;
}

// ─── User Companies ───────────────────────────────────────────────────────────

export interface UserCompanyRead {
  id: string;
  user_id: string;
  company_id: string;
  user_company_status: number;
}

export interface UserCompanyCreate {
  user_id: string;
  company_id: string;
  user_company_status?: number;
}

export interface UserCompanyUpdate {
  user_id?: string;
  company_id?: string;
  user_company_status?: number;
}

// ─── Noty Users ───────────────────────────────────────────────────────────────

export interface NotyUserRead {
  id: string;
  noty_user_id: string;
  noty_id: string;
  noty_user_view: number;
  noty_status: number;
  noty_name?: string;
  noty_desc?: string;
  noty_type?: string;
  noty_expired?: string;
}

export interface NotyUserCreate {
  noty_user_id: string;
  noty_id: string;
  noty_user_view?: number;
  noty_status?: number;
}

export interface NotyUserUpdate {
  noty_user_id?: string;
  noty_id?: string;
  noty_user_view?: number;
  noty_status?: number;
}

// ─── Project Types & Statuses ─────────────────────────────────────────────────

export interface ProjectTypeRead {
  id: string;
  project_type_name: string;
  project_type_desc?: string;
  project_type_icon: string;
  project_type_active: string;
}

export interface ProjectStatusRead {
  id: string;
  project_status_name: string;
  project_status_active: string;
}

// ─── Permissions (extended) ───────────────────────────────────────────────────

export interface ModulePermissionsRead {
  module_id: string;
  module_name: string;
  permissions: PermissionRead[];
}

export interface PermissionUserRead {
  role_name: string;
  module_name?: string;
  cmetadata?: Record<string, unknown>;
}

// ─── User Deletion ────────────────────────────────────────────────────────────

export interface UserDeletionResponse {
  user_id: string;
  db_deleted: boolean;
  s3: Record<string, unknown>;
  deleted_rows: Record<string, number>;
}

// ─── Shared ──────────────────────────────────────────────────────────────────

export interface APIError {
  detail: string | { msg: string; type: string }[];
}
