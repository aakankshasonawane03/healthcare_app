import { AppModule } from "@/core/module"

export const ClinicModule: AppModule = {
  name: "clinic",

  menu: {
    label: "Clinic",
    path: "/clinic",
  },

  permissions: {
    read: "clinic.read",
    write: "clinic.write",
  },
}