package handlers

import (
	"net/http"

	"ecommerce-backend/models"

	"github.com/gin-gonic/gin"
)

func CreateOrder(c *gin.Context) {
	userID := c.GetUint("userID")

	// Get user's cart
	var cart models.Cart
	if err := db.Preload("Items.Product").Where("user_id = ?", userID).First(&cart).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cart is empty"})
		return
	}

	if len(cart.Items) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cart is empty"})
		return
	}

	// Calculate total
	var total float64
	var orderItems []models.OrderItem
	for _, item := range cart.Items {
		orderItems = append(orderItems, models.OrderItem{
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
			Price:     item.Product.Price,
		})
		total += item.Product.Price * float64(item.Quantity)
	}

	// Create order
	order := models.Order{
		UserID:      userID,
		Items:       orderItems,
		TotalAmount: total,
		Status:      "pending",
	}

	if err := db.Create(&order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create order"})
		return
	}

	// Clear cart
	if err := db.Where("cart_id = ?", cart.ID).Delete(&models.CartItem{}).Error; err != nil {
		// Log error but don't fail the order
	}

	c.JSON(http.StatusCreated, order)
}

func GetOrders(c *gin.Context) {
	userID := c.GetUint("userID")
	var orders []models.Order
	if err := db.Preload("Items.Product").Where("user_id = ?", userID).Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}
	c.JSON(http.StatusOK, orders)
}

func GetOrder(c *gin.Context) {
	userID := c.GetUint("userID")
	orderID := c.Param("id")

	var order models.Order
	if err := db.Preload("Items.Product").Where("id = ? AND user_id = ?", orderID, userID).First(&order).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}
	c.JSON(http.StatusOK, order)
}