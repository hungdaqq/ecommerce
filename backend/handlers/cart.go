package handlers

import (
	"net/http"
	"strconv"

	"ecommerce-backend/models"

	"github.com/gin-gonic/gin"
)

func GetCart(c *gin.Context) {
	userID := c.GetUint("userID")
	var cart models.Cart
	if err := db.Preload("Items.Product").Where("user_id = ?", userID).FirstOrCreate(&cart, models.Cart{UserID: userID}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cart"})
		return
	}
	c.JSON(http.StatusOK, cart)
}

func AddToCart(c *gin.Context) {
	userID := c.GetUint("userID")
	var itemData struct {
		ProductID uint `json:"product_id"`
		Quantity  int  `json:"quantity"`
	}
	if err := c.ShouldBindJSON(&itemData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var cart models.Cart
	if err := db.Where("user_id = ?", userID).FirstOrCreate(&cart, models.Cart{UserID: userID}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get cart"})
		return
	}

	var cartItem models.CartItem
	if err := db.Where("cart_id = ? AND product_id = ?", cart.ID, itemData.ProductID).First(&cartItem).Error; err != nil {
		// Create new item
		cartItem = models.CartItem{
			CartID:    cart.ID,
			ProductID: itemData.ProductID,
			Quantity:  itemData.Quantity,
		}
		if err := db.Create(&cartItem).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add item to cart"})
			return
		}
	} else {
		// Update quantity
		cartItem.Quantity += itemData.Quantity
		if err := db.Save(&cartItem).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update cart item"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Item added to cart"})
}

func UpdateCartItem(c *gin.Context) {
	userID := c.GetUint("userID")
	itemID, err := strconv.Atoi(c.Param("itemId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid item ID"})
		return
	}

	var updateData struct {
		Quantity int `json:"quantity"`
	}
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var cartItem models.CartItem
	if err := db.Joins("JOIN carts ON carts.id = cart_items.cart_id").Where("cart_items.id = ? AND carts.user_id = ?", itemID, userID).First(&cartItem).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cart item not found"})
		return
	}

	cartItem.Quantity = updateData.Quantity
	if err := db.Save(&cartItem).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update cart item"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cart item updated"})
}

func RemoveFromCart(c *gin.Context) {
	userID := c.GetUint("userID")
	itemID, err := strconv.Atoi(c.Param("itemId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid item ID"})
		return
	}

	if err := db.Exec("DELETE cart_items FROM cart_items JOIN carts ON carts.id = cart_items.cart_id WHERE cart_items.id = ? AND carts.user_id = ?", itemID, userID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove item from cart"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Item removed from cart"})
}