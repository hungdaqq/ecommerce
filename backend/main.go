package main

import (
	"log"
	"os"

	"ecommerce-backend/handlers"
	"ecommerce-backend/middleware"
	"ecommerce-backend/models"
	"ecommerce-backend/routes"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var db *gorm.DB

func createDefaultAdmin(db *gorm.DB) {
	var admin models.User
	result := db.Where("email = ?", "admin@ergolife.com").First(&admin)

	if result.Error != nil {
		// Admin doesn't exist, create one
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
		if err != nil {
			log.Println("Failed to hash admin password:", err)
			return
		}

		admin = models.User{
			Email:    "admin@ergolife.com",
			Password: string(hashedPassword),
			Name:     "Admin User",
			Role:     "ADMIN",
		}

		if err := db.Create(&admin).Error; err != nil {
			log.Println("Failed to create default admin:", err)
			return
		}

		log.Println("Default admin user created: admin@ergolife.com / admin123")
	}
}

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Connect to database
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "host=localhost user=postgres password=newpassword dbname=ecommerce port=5432 sslmode=disable"
	}
	var err error
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto migrate the schema
	db.AutoMigrate(&models.User{}, &models.Product{}, &models.Cart{}, &models.CartItem{}, &models.Order{}, &models.OrderItem{}, &models.Voucher{}, &models.Blog{})

	// Create default admin user if it doesn't exist
	createDefaultAdmin(db)

	handlers.SetDB(db)
	middleware.SetDB(db)

	// Setup Gin router
	r := gin.Default()

	// CORS middleware
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// Routes
	routes.SetupRoutes(r)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	r.Run(":" + port)
}
