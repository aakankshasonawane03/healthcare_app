import { AppModule } from "@/core/module"

export const ConsultationModule: AppModule = {
  name: "Consultation",

  menu: {
    label: "Consultation",
    path: "/Consultation",
  },

  permissions: {
    read: "Consultation.read",
    write: "Consultation.write",
  },
}