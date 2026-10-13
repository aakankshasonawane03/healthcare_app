import { AppModule } from "@/core/module"

export const AdminModule: AppModule = {
  name: "admin",

  menu: {
    label: "Admin",
    path: "/admin",
  },

  permissions: {
    read: "admin.read",
    write: "admin.write",
  },
}