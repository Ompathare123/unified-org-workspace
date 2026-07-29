export interface AuditLogFilters {
  startDate?: string;
  endDate?: string;
  userId?: string;
  entityType?: string;
  action?: string;
}

export interface CreateAuditInput {
  organizationId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}
