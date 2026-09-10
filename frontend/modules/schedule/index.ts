import { AppModule } from "@/core/module"

export const ScheduleModule: AppModule = {
  name: "schedule",

  menu: {
    label: "Schedule",
    path: "/schedule",
  },

  permissions: {
    read: "schedule.read",
    write: "schedule.write",
  },
}