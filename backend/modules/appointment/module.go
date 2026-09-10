
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

	notificationService "github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/modules/notification/service"
)

const ModuleName = "appointment"

type Module struct {
	handler *appointmentHandler.AppointmentHandler
	service appointmentService.AppointmentService
}

// ============================================================
// CREATE MODULE
// ============================================================

func NewModule() *Module {
	return &Module{}
}

// ============================================================
// MODULE NAME
// ============================================================

func (m *Module) Name() string {
	return ModuleName
}

// ============================================================
// SERVICE
// ============================================================

func (m *Module) Service() appointmentService.AppointmentService {
	return m.service
}

// ============================================================
// MODULE INITIALIZATION
// ============================================================

func (m *Module) Init(ctx *module.ModuleContext) error {

	// --------------------------------------------------------
	// MongoDB Collections
	// --------------------------------------------------------

	appointmentCollection := ctx.DB.Collection("appointments")

	doctorCollection := ctx.DB.Collection("doctors")

	patientCollection := ctx.DB.Collection("patients")

	// --------------------------------------------------------
	// Repositories
	// --------------------------------------------------------

	appointmentRepo :=
		appointmentRepository.NewAppointmentRepository(
			appointmentCollection,
		)

	doctorRepo :=
		doctorRepository.NewDoctorRepository(
			doctorCollection,
		)

	patientRepo :=
		patientRepository.NewPatientRepository(
			patientCollection,
		)

	// --------------------------------------------------------
	// Notification Service
	// --------------------------------------------------------
	//
	// Firebase client must come from your ModuleContext.
	// If FirebaseClient is not currently present in
	// ModuleContext, use nil temporarily or add it there.
	//

	notificationSvc :=
		notificationService.NewService(
			ctx.FirebaseClient,
		)

	// --------------------------------------------------------
	// Appointment Service
	// --------------------------------------------------------

	appointmentSvc :=
		appointmentService.NewAppointmentService(
			appointmentRepo,
			doctorRepo,
			patientRepo,
			notificationSvc,
		)

	m.service = appointmentSvc

	// --------------------------------------------------------
	// Appointment Handler
	// --------------------------------------------------------

	m.handler =
		appointmentHandler.NewAppointmentHandler(
			appointmentSvc,
		)

	return nil
}

// ============================================================
// ROUTES
// ============================================================

func (m *Module) RegisterRoutes(
	r *gin.RouterGroup,
) {

	// --------------------------------------------------------
	// Health Check
	// --------------------------------------------------------

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

	// --------------------------------------------------------
	// Protected Appointment Routes
	// --------------------------------------------------------

	protected :=
		r.Group("/appointments")

	protected.Use(
		middleware.AuthMiddleware(),
	)

	// --------------------------------------------------------
	// CREATE
	// POST /api/appointment/appointments/createappointment
	// --------------------------------------------------------

	protected.POST(
		"/createappointment",
		m.handler.CreateAppointment,
	)

	// --------------------------------------------------------
	// GET ALL
	// GET /api/appointment/appointments/list
	// --------------------------------------------------------

	protected.GET(
		"/list",
		m.handler.GetAllAppointments,
	)

	// --------------------------------------------------------
	// GET BY ID
	// GET /api/appointment/appointments/view/:id
	// --------------------------------------------------------

	protected.GET(
		"/view/:id",
		m.handler.GetAppointmentByID,
	)

	// --------------------------------------------------------
	// UPDATE
	// PUT /api/appointment/appointments/update/:id
	// --------------------------------------------------------

	protected.PUT(
		"/update/:id",
		m.handler.UpdateAppointment,
	)

	// --------------------------------------------------------
	// DELETE
	// DELETE /api/appointment/appointments/delete/:id
	// --------------------------------------------------------

	protected.DELETE(
		"/delete/:id",
		m.handler.DeleteAppointment,
	)
}

// ============================================================
// COMPILE-TIME SAFETY
// ============================================================

var _ module.Module = (*Module)(nil)

