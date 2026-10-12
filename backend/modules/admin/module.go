
package admin

import (
	"github.com/gin-gonic/gin"

	"github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/core/module"
	"github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/modules/admin/handler"
	"github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/modules/admin/repository"
	"github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/modules/admin/service"
	authMiddleware "github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/modules/auth/middleware"
	adminMiddleware "github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/modules/admin/middleware"
)

const ModuleName = "admin"

type Module struct {
	handler *handler.AdminHandler
}

func NewModule() *Module {
	return &Module{}
}

func (m *Module) Name() string {
	return ModuleName
}

func (m *Module) Init(ctx *module.ModuleContext) error {

	// MongoDB collections
	usersCollection := ctx.DB.Collection("users")
	doctorsCollection := ctx.DB.Collection("doctors")
	patientsCollection := ctx.DB.Collection("patients")
	clinicsCollection := ctx.DB.Collection("clinics")
	appointmentsCollection := ctx.DB.Collection("appointments")

	// Repository
	adminRepository := repository.NewAdminRepository(
		usersCollection,
		doctorsCollection,
		patientsCollection,
		clinicsCollection,
		appointmentsCollection,
	)

	// Service
	adminService := service.NewAdminService(adminRepository)

	// Handler
	m.handler = handler.NewAdminHandler(adminService)

	return nil
}

func (m *Module) RegisterRoutes(r *gin.RouterGroup) {

	// IMPORTANT:
	// The framework already creates:
	// /api/admin
	//
	// Therefore we register routes directly on r.

	r.Use(authMiddleware.AuthMiddleware())
	r.Use(adminMiddleware.AdminMiddleware())

	// Dashboard
	r.GET("/dashboard", m.handler.Dashboard)

	// Users
	r.GET("/users", m.handler.GetUsers)
	r.PUT("/users/:id/status", m.handler.UpdateUserStatus)

	// Doctors
	r.GET("/doctors", m.handler.GetDoctors)

	// Patients
	r.GET("/patients", m.handler.GetPatients)

	// Clinics
	r.GET("/clinics", m.handler.GetClinics)
	r.POST("/clinics", m.handler.CreateClinic)
	r.PUT("/clinics/:id", m.handler.UpdateClinic)
	r.DELETE("/clinics/:id", m.handler.DeleteClinic)

	// Appointments
	r.GET("/appointments", m.handler.GetAppointments)
}

// Compile-time safety
var _ module.Module = (*Module)(nil)
