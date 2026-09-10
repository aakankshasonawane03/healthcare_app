package repository

import (
	"context"

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
	return &userRepository{
		collection: collection,
	}
}

func (r *userRepository) Create(
	ctx context.Context,
	user *model.User,
) error {

	_, err := r.collection.InsertOne(ctx, user)

	return err
}

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
