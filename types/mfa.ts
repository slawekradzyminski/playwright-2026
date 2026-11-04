export interface MfaSetupDto {
  secret: string;
  otpAuthUri: string;
  qrCodeDataUri: string;
  expiresAt: string;
}

export interface MfaStatusDto {
  enabled: boolean;
  unusedRecoveryCodes: number;
}

export interface MfaRecoveryCodesDto {
  recoveryCodes: string[];
}

/** Secret of an enabled authenticator and the time step its confirming code used. */
export interface MfaEnrollment {
  secret: string;
  timeStep: number;
}
