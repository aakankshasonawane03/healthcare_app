import { AppModule } from "@/core/module"

export const AuthModule: AppModule = {
  name: "auth",

  menu: {
    label: "Auth",
    path: "/auth",
  },

  permissions: {
    read: "auth.read",
    write: "auth.write",
  },
}