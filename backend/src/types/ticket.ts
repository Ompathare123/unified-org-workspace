export interface CreateTicketInput {
  title: string;
  description: string;
}

export interface UpdateTicketInput {
  title?: string;
  description?: string;
  status?:
    | "OPEN"
    | "IN_PROGRESS"
    | "ON_HOLD"
    | "RESOLVED"
    | "CLOSED";
  assignedToId?: string;
}