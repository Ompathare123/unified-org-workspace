import { SharedItemType } from "@prisma/client";

export interface CreateShareInput {
  type: SharedItemType; // TICKET | PULL_REQUEST
  itemId: string; // the ticketId or pullRequestId
  sharedWithUserId: string; // The user in the partner org
  permission?: string;
}
