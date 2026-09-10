// AUTO-GENERATED FILE — DO NOT EDIT

import { ConsultationModule as consultationModule } from "@/modules/Consultation"
import { AuthModule as authModule } from "@/modules/auth"
import { ClinicModule as clinicModule } from "@/modules/clinic"
import { MedicalrecordModule as medicalrecordModule } from "@/modules/medicalrecord"
import { NotificationModule as notificationModule } from "@/modules/notification"
import { PrescriptionModule as prescriptionModule } from "@/modules/prescription"
import { QueueModule as queueModule } from "@/modules/queue"
import { ScheduleModule as scheduleModule } from "@/modules/schedule"

export function loadModules() {
  return [
    consultationModule,
    authModule,
    clinicModule,
    medicalrecordModule,
    notificationModule,
    prescriptionModule,
    queueModule,
    scheduleModule
  ]
}
