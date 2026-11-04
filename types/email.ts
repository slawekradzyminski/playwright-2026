export type EmailEvent = {
  type: string;
  status: 'QUEUED' | 'SENT_TO_SMTP_SINK' | 'FAILED';
  recipientMasked: string;
  createdAt: string;
  updatedAt: string;
  failureReason: string | null;
};
