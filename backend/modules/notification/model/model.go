package model

import (
	"time"
)

type Notification struct {
	ID          string    `bson:"_id,omitempty" json:"id"`
	UserID      string    `bson:"user_id" json:"user_id"`
	Title       string    `bson:"title" json:"title"`
	Message     string    `bson:"message" json:"message"`
	ReferenceID string    `bson:"reference_id,omitempty" json:"reference_id,omitempty"`
	Type        string    `bson:"type" json:"type"`
	IsRead      bool      `bson:"is_read" json:"is_read"`
	CreatedAt   time.Time `bson:"created_at" json:"created_at"`
	UpdatedAt   time.Time `bson:"updated_at" json:"updated_at"`
}

type DeviceToken struct {
	ID        string    `bson:"_id,omitempty" json:"id"`
	UserID    string    `bson:"user_id" json:"user_id"`
	Token     string    `bson:"token" json:"token"`
	Platform  string    `bson:"platform,omitempty" json:"platform,omitempty"`
	IsActive  bool      `bson:"is_active" json:"is_active"`
	CreatedAt time.Time `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time `bson:"updated_at" json:"updated_at"`
}
