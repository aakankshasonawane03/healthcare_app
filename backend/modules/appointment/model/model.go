package model

import (
	"time"
)

type Appointment struct {

	ID string `bson:"_id,omitempty" json:"id"`

	DoctorID string `bson:"doctor_id" json:"doctor_id"`

	PatientID string `bson:"patient_id" json:"patient_id"`

	AppointmentDate time.Time `bson:"appointment_date" json:"appointment_date"`

	AppointmentTime string `bson:"appointment_time" json:"appointment_time"`

	Reason string `bson:"reason" json:"reason"`

	Status string `bson:"status" json:"status"`

	// Used by Cron to prevent duplicate reminders
	ReminderSent bool `bson:"reminder_sent" json:"reminder_sent"`

	CreatedAt time.Time `bson:"created_at" json:"created_at"`

	UpdatedAt time.Time `bson:"updated_at" json:"updated_at"`
}