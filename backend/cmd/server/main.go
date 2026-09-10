package main

import (
	"log"

	"github.com/gin-gonic/gin"

	"github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/core/config"
	"github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/core/config/database"
	"github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/core/events"
	"github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/core/middleware"
	"github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/core/module"

	modules "github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/modules"
)

func main() {

	// ============================================================
	// LOAD CONFIG
	// ============================================================

	cfg := config.Load()

	// ============================================================
	// CONNECT MONGODB
	// ============================================================

	db := database.Connect(cfg)

	config.SetDatabase(db)

	// ============================================================
	// INITIALIZE EVENT BUS
	// ============================================================

	bus := events.New()

	// ============================================================
	// INITIALIZE FIREBASE
	// ============================================================

	firebaseClient, err := config.InitFirebase()

	if err != nil {
		log.Fatalf(
			"❌ Failed to initialize Firebase: %v",
			err,
		)
	}

	log.Println("🔥 Firebase initialized successfully")

	// ============================================================
	// CREATE MODULE CONTEXT
	// ============================================================

	ctx := &module.ModuleContext{
		DB:             db,
		Config:         cfg,
		EventBus:       bus,
		FirebaseClient: firebaseClient,
	}

	// ============================================================
	// GIN
	// ============================================================

	r := gin.Default()

	r.Use(
		middleware.Recovery(),
		middleware.Logger(),
		middleware.CORS(),
		middleware.SecurityHeaders(),
		middleware.RateLimit(),
	)

	// ============================================================
	// MODULE LOADER
	// ============================================================

	loader := module.NewLoader()

	for _, m := range modules.LoadModules() {
		loader.Register(m)
	}

	// ============================================================
	// INITIALIZE MODULES
	// ============================================================

	loader.InitAll(ctx)

	// ============================================================
	// REGISTER ROUTES
	// ============================================================

	loader.SetupRoutes(r)

	// ============================================================
	// START SERVER
	// ============================================================

	log.Printf("🚀 Server running on :%s", cfg.Port)

	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal(err)
	}
}