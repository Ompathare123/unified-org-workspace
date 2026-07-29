import prisma from "../config/prisma";
import { CreateNotificationInput } from "../types/notification";

class NotificationService {
  // ─────────────────────────────────────────────────────────────────────────
  // Internal helper to create a notification securely
  // Fire-and-forget style similar to AuditService
  // ─────────────────────────────────────────────────────────────────────────
  async send(input: CreateNotificationInput): Promise<void> {
    try {
      await prisma.notification.create({
        data: {
          organizationId: input.organizationId,
          userId: input.userId,
          type: input.type,
          title: input.title,
          message: input.message,
          metadata: input.metadata ? (input.metadata as any) : undefined,
        },
      });
    } catch {
      // Swallowing errors for notifications so they don't break the main business logic
    }
  }

  // GET /api/notifications
  async getAll(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  // PATCH /api/notifications/:id/read
  async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error("Notification not found.");
    }

    if (notification.userId !== userId) {
      throw new Error("Unauthorized to access this notification.");
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  // PATCH /api/notifications/read-all
  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { message: "All notifications marked as read." };
  }

  // DELETE /api/notifications/:id
  async delete(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error("Notification not found.");
    }

    if (notification.userId !== userId) {
      throw new Error("Unauthorized to delete this notification.");
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return { message: "Notification deleted successfully." };
  }
}

export default new NotificationService();
