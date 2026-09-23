package database

import (
	"context"
	"log"
	"net/url"
	"time"

	mg "go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var Client *mg.Client
var DB *mg.Database

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

func Connect(dbUri string) *mg.Database {
	if dbUri == "" {
		dbUri = "mongodb://localhost:27017/healthcare"
	}

	ctx, cancel := context.WithTimeout(
		context.Background(),
		10*time.Second,
	)
	defer cancel()

	clientOptions := options.Client().ApplyURI(dbUri)

	client, err := mg.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatalf("MongoDB connection failed: %v", err)
	}

	if err := client.Ping(ctx, nil); err != nil {
		log.Fatalf("MongoDB ping failed: %v", err)
	}

	Client = client
	DB = client.Database(defaultDatabaseName(dbUri))

	log.Printf("MongoDB connected successfully to database: %s", defaultDatabaseName(dbUri))

	return DB
}

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

func GetDatabase() *mg.Database {
	return DB
}

func GetCollection(name string) *mg.Collection {
	if DB == nil {
		log.Fatal("MongoDB database is not initialized")
	}

	return DB.Collection(name)
}
