package auth

import (
	"github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/core/module"
	"github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/modules/auth/handler"
	"github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/modules/auth/repository"
	"github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/modules/auth/service"

	"github.com/gin-gonic/gin"
)

const ModuleName = "auth"

type Module struct {
	handler *handler.AuthController
}

func NewModule() *Module {
	return &Module{}
}

func (m *Module) Name() string {
	return ModuleName
}

func (m *Module) Init(ctx *module.ModuleContext) error {

	// Users collection
	userCollection := ctx.DB.Collection("users")

	// Refresh tokens collection
	refreshTokenCollection := ctx.DB.Collection("refresh_tokens")

	// Repository
	repo := repository.NewUserRepository(
		userCollection,
		refreshTokenCollection,
	)

	// Service
	authService := service.NewAuthService(repo)

	// Handler
	m.handler = handler.NewAuthController(authService)

	return nil
}

func (m *Module) RegisterRoutes(r *gin.RouterGroup) {

	// Module root
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": ModuleName + " module working 🚀",
		})
	})

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
			"module": ModuleName,
		})
	})

	// =========================
	// Public Authentication Routes
	// =========================

	// Register
	r.POST("/register", m.handler.Register)

	// Login
	r.POST("/login", m.handler.Login)

	// Refresh access token
	r.POST("/refresh", m.handler.RefreshToken)

	// Logout
	r.POST("/logout", m.handler.Logout)
}

var _ module.Module = (*Module)(nil)