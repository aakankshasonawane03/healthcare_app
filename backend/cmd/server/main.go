package main

import (
	"log"

	"github.com/gin-gonic/gin"

	"github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/core/config"
	"github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/core/config/database"
	"github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/cronnotification"
	"github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/core/events"
	"github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/core/middleware"
	"github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/core/module"

	modules "github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/modules"
)

func main() {

	// ============================================================
	// CONFIG
	// ============================================================

	cfg := config.Load()

	// ============================================================
	// DATABASE
	// ============================================================

	db := database.Connect(cfg)

	// ============================================================
	// EVENT BUS
	// ============================================================

	bus := events.New()

	// ============================================================
	// FIREBASE
	// ============================================================

	firebaseClient, err := config.InitFirebase()
	if err != nil {
		log.Fatalf("❌ Failed to initialize Firebase: %v", err)
	}

	// log.Println("🔥 Firebase initialized successfully")

	// ============================================================
	// MODULE CONTEXT
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

	gin.SetMode(gin.ReleaseMode)

	r := gin.New()

	r.SetTrustedProxies([]string{
		"127.0.0.1",
		"::1",
	})

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

	// Initialize all modules
	loader.InitAll(ctx)

	// ============================================================
	// TEST CRON
	// ============================================================

	log.Println("⏰ Starting test cron...")

	cronJob := cronnotification.StartTestCron()

	if cronJob != nil {
		defer cronJob.Stop()
	}

	// ============================================================
	// ROUTES
	// ============================================================

	loader.SetupRoutes(r)

	// ============================================================
	// SERVER
	// ============================================================

	log.Printf("🚀 Server running on :%s", cfg.Port)

	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal(err)
	}
}