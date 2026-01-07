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

	// Public blog routes
	r.GET("/api/blogs", handlers.GetPublishedBlogs)
	r.GET("/api/blogs/:id", handlers.GetPublishedBlog)

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

		// Admin routes
		admin := api.Group("/admin")
		admin.Use(middleware.AdminMiddleware())
		{
			admin.GET("/dashboard", handlers.GetDashboardStats)

			// Users
			admin.GET("/users", handlers.GetUsers)
			admin.POST("/users", handlers.CreateUser)
			admin.PUT("/users/:id", handlers.UpdateUser)
			admin.DELETE("/users/:id", handlers.DeleteUser)

			// Products
			admin.GET("/products", handlers.GetProducts)
			admin.POST("/products", handlers.CreateProduct)
			admin.PUT("/products/:id", handlers.UpdateProduct)
			admin.DELETE("/products/:id", handlers.DeleteProduct)

			// Vouchers
			admin.GET("/vouchers", handlers.GetVouchers)
			admin.POST("/vouchers", handlers.CreateVoucher)
			admin.PUT("/vouchers/:id", handlers.UpdateVoucher)
			admin.DELETE("/vouchers/:id", handlers.DeleteVoucher)

			// Blogs
			admin.GET("/blogs", handlers.GetBlogs)
			admin.POST("/blogs", handlers.CreateBlog)
			admin.PUT("/blogs/:id", handlers.UpdateBlog)
			admin.DELETE("/blogs/:id", handlers.DeleteBlog)
		}
	}
}
