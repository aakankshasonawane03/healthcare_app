package appointment

import (
	"github.com/gin-gonic/gin"

	"github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/core/middleware"
	"github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/core/module"

	appointmentHandler "github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/modules/appointment/handler"
	appointmentRepository "github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/modules/appointment/repository"
	appointmentService "github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/modules/appointment/service"

	doctorRepository "github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/modules/doctor/repository"
	patientRepository "github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/modules/patients/repository"
)

const ModuleName = "appointment"

type Module struct {
	handler *appointmentHandler.AppointmentHandler
}

func NewModule() *Module {
	return &Module{}
}

func (m *Module) Name() string {
	return ModuleName
}

func (m *Module) Init(ctx *module.ModuleContext) error {

	// =====================================================
	// MongoDB Collections
	// =====================================================

	appointmentCollection := ctx.DB.Collection("appointments")
	doctorCollection := ctx.DB.Collection("doctors")
	patientCollection := ctx.DB.Collection("patients")

	// =====================================================
	// Repositories
	// =====================================================

	appointmentRepo := appointmentRepository.NewAppointmentRepository(
		appointmentCollection,
	)

	doctorRepo := doctorRepository.NewDoctorRepository(
		doctorCollection,
	)

	patientRepo := patientRepository.NewPatientRepository(
		patientCollection,
	)

	// =====================================================
	// Notification Service
	// =====================================================

	notificationSvc := ctx.NotificationService

	// =====================================================
	// Appointment Service
	// =====================================================

	appointmentSvc := appointmentService.NewAppointmentService(
		appointmentRepo,
		doctorRepo,
		patientRepo,
		notificationSvc,
	)

	// =====================================================
	// Handler
	// =====================================================

	m.handler = appointmentHandler.NewAppointmentHandler(
		appointmentSvc,
	)

	return nil
}

func (m *Module) RegisterRoutes(
	r *gin.RouterGroup,
) {

	// =====================================================
	// Health APIs
	// =====================================================

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

	// =====================================================
	// Protected Appointment Routes
	// =====================================================

	protected := r.Group("/appointments")

	protected.Use(
		middleware.AuthMiddleware(),
	)

	// Create
	protected.POST(
		"/createappointment",
		m.handler.CreateAppointment,
	)

	// Get all
	protected.GET(
		"/list",
		m.handler.GetAllAppointments,
	)

	// Get by ID
	protected.GET(
		"/view/:id",
		m.handler.GetAppointmentByID,
	)

	// Update
	protected.PUT(
		"/update/:id",
		m.handler.UpdateAppointment,
	)

	// Delete
	protected.DELETE(
		"/delete/:id",
		m.handler.DeleteAppointment,
	)
}

// Compile-time safety
var _ module.Module = (*Module)(nil)