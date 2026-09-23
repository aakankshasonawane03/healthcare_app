package notification

import (
	"github.com/gin-gonic/gin"

	"github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/core/module"
	"github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/modules/notification/handler"
	"github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/modules/notification/service"
)

type Module struct {
	handler *handler.Handler
	service *service.Service
}

func NewModule() *Module {
	return &Module{}
}

func (m *Module) Name() string {
	return "notification"
}

func (m *Module) Service() *service.Service {
	return m.service
}

func (m *Module) Init(
	ctx *module.ModuleContext,
) error {

	m.service = service.NewService(
		ctx.FirebaseClient,
	)

	ctx.NotificationService = m.service

	m.handler = handler.NewHandler(
		m.service,
	)

	return nil
}

func (m *Module) RegisterRoutes(
	router *gin.RouterGroup,
) {

	router.POST(
		"/createnotification",
		m.handler.Create,
	)

	router.GET(
		"/getnotifications",
		m.handler.GetAll,
	)

	router.GET(
		"/unread",
		m.handler.GetUnread,
	)

	router.POST(
		"/device-token",
		m.handler.RegisterDeviceToken,
	)

	router.PUT(
		"/:id/read",
		m.handler.MarkAsRead,
	)

	router.PUT(
		"/read-all",
		m.handler.MarkAllAsRead,
	)

	router.DELETE(
		"/:id",
		m.handler.Delete,
	)
}