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

	collection := ctx.DB.Collection("users")

	repo := repository.NewUserRepository(collection)

	authService := service.NewAuthService(repo)

	m.handler = handler.NewAuthController(authService)

	return nil
}

func (m *Module) RegisterRoutes(r *gin.RouterGroup) {

	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": ModuleName + " module working 🚀",
		})
	})

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
			"module": ModuleName,
		})
	})

	// Public routes
	r.POST("/register", m.handler.Register)
	r.POST("/login", m.handler.Login)
}

var _ module.Module = (*Module)(nil)
