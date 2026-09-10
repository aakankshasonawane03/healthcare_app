import { AppModule } from "@/core/module"

export const PrescriptionModule: AppModule = {
  name: "prescription",

  menu: {
    label: "Prescription",
    path: "/prescription",
  },

  permissions: {
    read: "prescription.read",
    write: "prescription.write",
  },
}