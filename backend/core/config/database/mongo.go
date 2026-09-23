package database

import (
	"context"
	"log"
	"net/url"
	"time"

	"github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/core/config"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var Client *mongo.Client
var DB *mongo.Database

func defaultDatabaseName(uri string) string {
	if uri == "" {
		return "healthcare"
	}

	parsed, err := url.Parse(uri)
	if err == nil && parsed.Path != "" && parsed.Path != "/" {
		name := parsed.Path
		if len(name) > 0 && name[0] == '/' {
			name = name[1:]
		}
		if name != "" {
			return name
		}
	}

	return "healthcare"
}

// Connect connects to MongoDB using the application configuration.
func Connect(cfg *config.Config) *mongo.Database {
	if cfg == nil {
		cfg = &config.Config{
			DBUri: "mongodb://localhost:27017/healthcare",
		}
	}

	if cfg.DBUri == "" {
		cfg.DBUri = "mongodb://localhost:27017/healthcare"
	}

	ctx, cancel := context.WithTimeout(
		context.Background(),
		10*time.Second,
	)
	defer cancel()

	clientOptions := options.Client().ApplyURI(cfg.DBUri)

	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatalf("MongoDB connection failed: %v", err)
	}

	// Verify connection
	if err := client.Ping(ctx, nil); err != nil {
		log.Fatalf("MongoDB ping failed: %v", err)
	}

	dbName := defaultDatabaseName(cfg.DBUri)
	Client = client
	DB = client.Database(dbName)

	log.Printf("MongoDB connected successfully to database: %s", dbName)

	return DB
}

// Disconnect closes the MongoDB connection.
func DisconnectMongoDB() error {
	if Client == nil {
		return nil
	}

	ctx, cancel := context.WithTimeout(
		context.Background(),
		10*time.Second,
	)
	defer cancel()

	err := Client.Disconnect(ctx)

	if err == nil {
		log.Println("MongoDB disconnected successfully")
	}

	return err
}

// GetDatabase returns the current MongoDB database.
func GetDatabase() *mongo.Database {
	return DB
}

// GetCollection returns a MongoDB collection.
func GetCollection(name string) *mongo.Collection {
	if DB == nil {
		log.Fatal("MongoDB database is not initialized")
	}

	return DB.Collection(name)
}
