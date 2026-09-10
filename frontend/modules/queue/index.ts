import { AppModule } from "@/core/module"

export const QueueModule: AppModule = {
  name: "queue",

  menu: {
    label: "Queue",
    path: "/queue",
  },

  permissions: {
    read: "queue.read",
    write: "queue.write",
  },
}