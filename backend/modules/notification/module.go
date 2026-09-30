package notification

import (
	"github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/core/module"
	"github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/modules/notification/handler"
	"github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/modules/notification/service"
	"github.com/gin-gonic/gin"
	"net/http"
)

const ModuleName = "notification"

type Module struct {
	handler *handler.Handler
	service *service.Service
}

// NewModule creates notification module
func NewModule() *Module {
	return &Module{}
}

// Name returns module name
func (m *Module) Name() string {
	return ModuleName
}

// Service returns notification service
//
// Other modules such as Appointment can use this service
// for sending notifications.
func (m *Module) Service() *service.Service {
	return m.service
}

// Init initializes notification module
func (m *Module) Init(ctx *module.ModuleContext) error {

	// Create notification service using Firebase client
	m.service = service.NewService(ctx.FirebaseClient)

	// Make notification service available to other modules
	m.SetNotificationService(ctx)

	// Create notification handler
	m.handler = handler.NewHandler(m.service)

	return nil
}

// SetNotificationService exposes notification service
// through ModuleContext.
func (m *Module) SetNotificationService(ctx *module.ModuleContext) {
	ctx.NotificationService = m.service
}

// RegisterRoutes registers notification APIs
func (m *Module) RegisterRoutes(r *gin.RouterGroup) {

	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"module":  ModuleName,
			"message": "Notification module is working",
			"success": true,
		})
	})

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"module":  ModuleName,
			"status":  "healthy",
			"success": true,
		})
	})

	protected := r.Group("/notifications")

	protected.POST(
		"/createnotification",
		m.handler.Create,
	)

	protected.GET(
		"/getnotifications",
		m.handler.GetAll,
	)

	protected.GET(
		"/unread",
		m.handler.GetUnread,
	)

	protected.POST(
		"/device-token",
		m.handler.RegisterDeviceToken,
	)

	protected.PUT(
		"/:id/read",
		m.handler.MarkAsRead,
	)

	protected.PUT(
		"/read-all",
		m.handler.MarkAllAsRead,
	)

	protected.DELETE(
		"/:id",
		m.handler.DeleteNotification,
	)
}

// Compile-time check
var _ module.Module = (*Module)(nil)