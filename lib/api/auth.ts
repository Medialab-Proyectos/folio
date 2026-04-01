import { api, tokens } from './client';
import type {
  UserLogin,
  TokenWithRefresh,
  AccessToken,
  RefreshTokenRequest,
  LogoutRequest,
  ChangePasswordRequest,
  GoogleValidateRequest,
  AppleValidateRequest,
  RegisterUserCreate,
  UserRead,
  GenerateOTPRequest,
  ValidateOTPRequest,
  OTPChangePasswordRequest,
} from './types';

export const authApi = {
  /** Authenticate with email/password → returns JWT tokens */
  login: async (data: UserLogin): Promise<TokenWithRefresh> => {
    const result = await api.post<TokenWithRefresh>('/auth/login', data, { auth: false });
    tokens.set(result.access_token, result.refresh_token);
    return result;
  },

  /** Register a new user — must NOT send token (server uses token email otherwise) */
  register: (data: RegisterUserCreate): Promise<UserRead> =>
    api.post<UserRead>('/auth/register', data, { auth: false }),

  /** Refresh access token using refresh token */
  refresh: (data: RefreshTokenRequest): Promise<AccessToken> =>
    api.post<AccessToken>('/auth/refresh', data, { auth: false }),

  /** Logout and revoke refresh token */
  logout: async (data: LogoutRequest): Promise<void> => {
    await api.post<void>('/auth/logout', data, { auth: false });
    tokens.clear();
  },

  /** Change password for the authenticated user */
  changePassword: (data: ChangePasswordRequest): Promise<void> =>
    api.post<void>('/auth/change-password', data),

  /** Validate Google ID token */
  validateGoogle: (data: GoogleValidateRequest): Promise<TokenWithRefresh> =>
    api.post<TokenWithRefresh>('/auth/validate/google', data, { auth: false }),

  /** Validate Apple identity token */
  validateApple: (data: AppleValidateRequest): Promise<TokenWithRefresh> =>
    api.post<TokenWithRefresh>('/auth/validate/apple', data, { auth: false }),

  // ─── OTP ──────────────────────────────────────────────────────────────────

  /** Generate and send OTP to email */
  generateOTP: (data: GenerateOTPRequest): Promise<void> =>
    api.post<void>('/auth/generate-otp', data, { auth: false }),

  /** Validate OTP code */
  validateOTP: (data: ValidateOTPRequest): Promise<void> =>
    api.post<void>('/auth/validate-otp', data, { auth: false }),

  /** Change password using a valid OTP */
  otpChangePassword: (data: OTPChangePasswordRequest): Promise<void> =>
    api.post<void>('/auth/otp-change-password', data, { auth: false }),
};
