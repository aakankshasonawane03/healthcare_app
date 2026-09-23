package service

import (
	"context"
	"errors"
	"os"
	"strings"
	"time"

	"github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/modules/auth/model"
	"github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/modules/auth/repository"

	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

type AuthService interface {
	Register(
		ctx context.Context,
		user *model.User,
	) error

	Login(
		ctx context.Context,
		email string,
		password string,
	) (string, *model.User, error)

	GetUserByID(
		ctx context.Context,
		id primitive.ObjectID,
	) (*model.User, error)
}

type authService struct {
	repository repository.UserRepository
}

func NewAuthService(
	repo repository.UserRepository,
) AuthService {
	return &authService{
		repository: repo,
	}
}

func (s *authService) Register(
	ctx context.Context,
	user *model.User,
) error {

	// Check if email already exists
	existingUser, err := s.repository.FindByEmail(
		ctx,
		user.Email,
	)

	if err == nil && existingUser != nil {
		return errors.New("email already registered")
	}

	if err != nil && !errors.Is(err, mongo.ErrNoDocuments) {
		return err
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(user.Password),
		bcrypt.DefaultCost,
	)

	if err != nil {
		return err
	}//

	user.ID = primitive.NewObjectID()

	user.Password = string(hashedPassword)

	if user.Role == "" {
		user.Role = "PATIENT"
	}

	user.IsActive = true

	now := time.Now()

	user.CreatedAt = now
	user.UpdatedAt = now

	return s.repository.Create(ctx, user)
}

func (s *authService) Login(
	ctx context.Context,
	email string,
	password string,
) (string, *model.User, error) {

	user, err := s.repository.FindByEmail(
		ctx,
		email,
	)

	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return "", nil, errors.New("invalid email or password")
		}

		return "", nil, err
	}

	if !user.IsActive {
		return "", nil, errors.New("user account is inactive")
	}

	err = bcrypt.CompareHashAndPassword(
		[]byte(user.Password),
		[]byte(password),
	)

	if err != nil {
		return "", nil, errors.New("invalid email or password")
	}

	token, err := generateJWT(user)

	if err != nil {
		return "", nil, err
	}

	return token, user, nil
}

func (s *authService) GetUserByID(
	ctx context.Context,
	id primitive.ObjectID,
) (*model.User, error) {

	return s.repository.FindByID(ctx, id)
}

func generateJWT(user *model.User) (string, error) {

	secret := os.Getenv("JWT_SECRET")

	if secret == "" {
		secret = "sharkweb-secret-key"
	}

	claims := jwt.MapClaims{
		"user_id": user.ID.Hex(),
		"email":   user.Email,
		"role":    user.Role,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
		"iat":     time.Now().Unix(),
	}

	token := jwt.NewWithClaims(
		jwt.SigningMethodHS256,
		claims,
	)

	return token.SignedString(
		[]byte(strings.TrimSpace(secret)),
	)
}
