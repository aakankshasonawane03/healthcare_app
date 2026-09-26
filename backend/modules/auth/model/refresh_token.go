package model

import (	
	"time"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type RefreshToken struct {
	ID primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	userID primitive.ObjectID `bson:"user_id" json:"user_id"`
	Tokenhash string `bson:"token" json:"token"`
	ExpiresAt time.Time `bson:"expires_at" json:"expires_at"`
	Revoked bool `bson:"revoked" json:"revoked"`
	CreatedAt time.Time `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time `bson:"updated_at" json:"updated_at"`
}
