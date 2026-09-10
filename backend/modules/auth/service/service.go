package service

import (
	"context"
	"errors"
	// "os"
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

// ===============================
// REGISTER
// ===============================

func (s *authService) Register(
	ctx context.Context,
	user *model.User,
) error {

	// Validate user
	if user == nil {
		return errors.New("user data is required")
	}

	if strings.TrimSpace(user.Email) == "" {
		return errors.New("email is required")
	}

	if strings.TrimSpace(user.Password) == "" {
		return errors.New("password is required")
	}

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
	}

	// Generate MongoDB ObjectID
	user.ID = primitive.NewObjectID()

	// Store hashed password instead of plain password
	user.Password = string(hashedPassword)

	// Default role
	if strings.TrimSpace(user.Role) == "" {
		user.Role = "PATIENT"
	}

	// Default active status
	user.IsActive = true

	// Timestamps
	now := time.Now()

	user.CreatedAt = now
	user.UpdatedAt = now

	// Create user
	return s.repository.Create(ctx, user)
}

// ===============================
// LOGIN
// ===============================

func (s *authService) Login(
	ctx context.Context,
	email string,
	password string,
) (string, *model.User, error) {

	email = strings.TrimSpace(email)

	if email == "" {
		return "", nil, errors.New("email is required")
	}

	if strings.TrimSpace(password) == "" {
		return "", nil, errors.New("password is required")
	}

	// Find user by email
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

	// Check account status
	if !user.IsActive {
		return "", nil, errors.New("user account is inactive")
	}

	// Compare password with hashed password
	err = bcrypt.CompareHashAndPassword(
		[]byte(user.Password),
		[]byte(password),
	)

	if err != nil {
		return "", nil, errors.New("invalid email or password")
	}

	// Generate JWT
	token, err := generateJWT(user)

	if err != nil {
		return "", nil, err
	}

	return token, user, nil
}

// ===============================
// GET USER BY ID
// ===============================

func (s *authService) GetUserByID(
	ctx context.Context,
	id primitive.ObjectID,
) (*model.User, error) {

	return s.repository.FindByID(
		ctx,
		id,
	)
}

// ===============================
// GENERATE JWT
// ===============================

func generateJWT(user *model.User) (string, error) {

	if user == nil {
		return "", errors.New("user is required")
	}

	secret := strings.TrimSpace(
		("JWT_SECRET"),
	)

	// Development fallback
	if secret == "" {
		secret = "sharkweb-secret-key"
	}

	now := time.Now()

	claims := jwt.MapClaims{
		"user_id": user.ID.Hex(),
		"email":   user.Email,
		"role":    user.Role,

		"iat": now.Unix(),

		// Token expires after 24 hours
		"exp": now.Add(24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(
		jwt.SigningMethodHS256,
		claims,
	)

	return token.SignedString(
		[]byte(secret),
	)
}