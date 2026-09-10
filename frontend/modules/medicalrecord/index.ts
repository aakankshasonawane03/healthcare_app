import { AppModule } from "@/core/module"

export const MedicalrecordModule: AppModule = {
  name: "medicalrecord",

  menu: {
    label: "Medicalrecord",
    path: "/medicalrecord",
  },

  permissions: {
    read: "medicalrecord.read",
    write: "medicalrecord.write",
  },
}