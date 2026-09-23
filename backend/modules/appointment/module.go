package appointment

import (
	"github.com/gin-gonic/gin"

	"github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/core/module"

	appointmentHandler "github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/modules/appointment/handler"
	appointmentRepository "github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/modules/appointment/repository"
	appointmentService "github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/modules/appointment/service"

	"github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/core/middleware"
	doctorRepository "github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/modules/doctor/repository"
	notificationService "github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/modules/notification/service"
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

	// Mongo Collections
	appointmentCollection := ctx.DB.Collection("appointments")
	doctorCollection := ctx.DB.Collection("doctors")
	patientCollection := ctx.DB.Collection("patients")

	// Repositories
	appointmentRepo := appointmentRepository.NewAppointmentRepository(appointmentCollection)
	doctorRepo := doctorRepository.NewDoctorRepository(doctorCollection)
	patientRepo := patientRepository.NewPatientRepository(patientCollection)

	// Service
	notificationSvc := notificationService.NewService(nil)

	appointmentService := appointmentService.NewAppointmentService(
		appointmentRepo,
		doctorRepo,
		patientRepo,
		notificationSvc,
	)

	// Handler
	m.handler = appointmentHandler.NewAppointmentHandler(
		appointmentService,
	)

	return nil
}

func (m *Module) RegisterRoutes(r *gin.RouterGroup) {

	// Health APIs
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

	protected := r.Group("/appointments")
	// use central middleware
	protected.Use(middleware.AuthMiddleware())

	// Appointment CRUD
	protected.POST("/createappointment", m.handler.CreateAppointment)
	protected.GET("/list", m.handler.GetAllAppointments)
	protected.GET("/view/:id", m.handler.GetAppointmentByID)
	protected.PUT("/update/:id", m.handler.UpdateAppointment)
	protected.DELETE("/delete/:id", m.handler.DeleteAppointment)
}

// Compile-time safety
var _ module.Module = (*Module)(nil)
