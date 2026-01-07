package routes

import (
	"ecommerce-backend/handlers"
	"ecommerce-backend/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	// Auth routes
	auth := r.Group("/auth")
	{
		auth.POST("/register", handlers.Register)
		auth.POST("/login", handlers.Login)
	}

	// Public product routes
	r.GET("/api/products", handlers.GetProducts)
	r.GET("/api/products/:id", handlers.GetProduct)

	// Protected routes
	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware())
	{
		// Product management routes
		products := api.Group("/products")
		{
			products.POST("", handlers.CreateProduct)
			products.PUT("/:id", handlers.UpdateProduct)
			products.DELETE("/:id", handlers.DeleteProduct)
		}

		// Cart routes
		cart := api.Group("/cart")
		{
			cart.GET("", handlers.GetCart)
			cart.POST("/add", handlers.AddToCart)
			cart.PUT("/item/:itemId", handlers.UpdateCartItem)
			cart.DELETE("/item/:itemId", handlers.RemoveFromCart)
		}

		// Order routes
		orders := api.Group("/orders")
		{
			orders.POST("", handlers.CreateOrder)
			orders.GET("", handlers.GetOrders)
			orders.GET("/:id", handlers.GetOrder)
		}
	}
}
