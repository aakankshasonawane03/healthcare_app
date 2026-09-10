package model

import (
	"time"
)

type MedicalRecord struct {
	ID string `bson:"_id,omitempty" json:"id,omitempty"`

	PatientID      string `bson:"patient_id" json:"patient_id"`
	DoctorID       string `bson:"doctor_id" json:"doctor_id"`
	ClinicID       string `bson:"clinic_id" json:"clinic_id"`
	ConsultationID string `bson:"consultation_id" json:"consultation_id"`

	Diagnosis string `bson:"diagnosis,omitempty" json:"diagnosis,omitempty"`
	Symptoms  string `bson:"symptoms,omitempty" json:"symptoms,omitempty"`
	Treatment string `bson:"treatment,omitempty" json:"treatment,omitempty"`
	Notes     string `bson:"notes,omitempty" json:"notes,omitempty"`

	RecordDate time.Time `bson:"record_date" json:"record_date"`

	CreatedAt time.Time `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time `bson:"updated_at" json:"updated_at"`
}
