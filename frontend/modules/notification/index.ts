import { AppModule } from "@/core/module"

export const NotificationModule: AppModule = {
  name: "notification",

  menu: {
    label: "Notification",
    path: "/notification",
  },

  permissions: {
    read: "notification.read",
    write: "notification.write",
  },
}