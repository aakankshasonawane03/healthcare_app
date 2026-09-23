package cronnotification

import (
	"log"

	"github.com/robfig/cron/v3"
)

func StartTestCron() *cron.Cron {

	// Create cron with seconds support
	c := cron.New(cron.WithSeconds())

	// Run every 10 seconds
	_, err := c.AddFunc("*/10 * * * * *", func() {
		log.Println("⏰ CRON IS RUNNING!")
		
	})

	if err != nil {
		log.Println("❌ Failed to register cron:", err)
		return nil
	}

	c.Start()

	log.Println("🚀 Test cron started")

	return c
}