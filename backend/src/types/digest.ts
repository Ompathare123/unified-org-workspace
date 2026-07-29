export interface DigestQueryParams {
  startDate?: string;
  endDate?: string;
}

export interface DigestResult {
  summary: string;
  stats: {
    ticketsCreated: number;
    ticketsResolved: number;
    prsCreated: number;
    prsApproved: number;
    reviewsCompleted: number;
    attachmentsUploaded: number;
    auditEvents: number;
    notificationsGenerated: number;
  };
}
