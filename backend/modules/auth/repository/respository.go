package repository

import (
	"context"
	"log"

	"github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/modules/auth/model"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type UserRepository interface {
	Create(ctx context.Context, user *model.User) error
	FindByEmail(ctx context.Context, email string) (*model.User, error)
	FindByID(ctx context.Context, id primitive.ObjectID) (*model.User, error)
}

type userRepository struct {
	collection *mongo.Collection
}

func NewUserRepository(
	collection *mongo.Collection,
) UserRepository {

	log.Printf(
		"Auth repository connected to database=%s collection=%s",
		collection.Database().Name(),
		collection.Name(),
	)

	return &userRepository{
		collection: collection,
	}
}

// Create inserts a new user into MongoDB.
func (r *userRepository) Create(
	ctx context.Context,
	user *model.User,
) error {

	log.Printf(
		"Saving user | database=%s | collection=%s | email=%s",
		r.collection.Database().Name(),
		r.collection.Name(),
		user.Email,
	)

	result, err := r.collection.InsertOne(ctx, user)

	if err != nil {
		log.Printf(
			"MongoDB INSERT ERROR: %v",
			err,
		)

		return err
	}

	log.Printf(
		"User saved successfully | inserted_id=%v | email=%s",
		result.InsertedID,
		user.Email,
	)

	return nil
}

// Find user by email.
func (r *userRepository) FindByEmail(
	ctx context.Context,
	email string,
) (*model.User, error) {

	var user model.User

	err := r.collection.FindOne(
		ctx,
		bson.M{
			"email": email,
		},
	).Decode(&user)

	if err != nil {
		return nil, err
	}

	return &user, nil
}

// Find user by MongoDB ObjectID.
func (r *userRepository) FindByID(
	ctx context.Context,
	id primitive.ObjectID,
) (*model.User, error) {

	var user model.User

	err := r.collection.FindOne(
		ctx,
		bson.M{
			"_id": id,
		},
	).Decode(&user)

	if err != nil {
		return nil, err
	}

	return &user, nil
}