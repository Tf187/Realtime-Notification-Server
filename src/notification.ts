import { z } from "zod";

export const notificationSchema = z.object({
  target: z.string().min(1),
  type: z.string().min(1).max(80),
  title: z.string().min(1).max(160),
  message: z.string().min(1).max(2000),
  data: z.record(z.string(), z.unknown()).optional()
});

export type NotificationInput = z.infer<typeof notificationSchema>;

export type Notification = NotificationInput & {
  id: string;
  createdAt: string;
};
