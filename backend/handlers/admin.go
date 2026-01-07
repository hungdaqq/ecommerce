package handlers

import (
	"net/http"
	"strconv"

	"ecommerce-backend/models"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// --- Dashboard ---
func GetDashboardStats(c *gin.Context) {
	var userCount int64
	var orderCount int64
	var productCount int64
	var totalRevenue float64

	db.Model(&models.User{}).Count(&userCount)
	db.Model(&models.Order{}).Count(&orderCount)
	db.Model(&models.Product{}).Count(&productCount)
	db.Model(&models.Order{}).Select("COALESCE(SUM(total_amount), 0)").Scan(&totalRevenue)

	c.JSON(http.StatusOK, gin.H{
		"users":    userCount,
		"orders":   orderCount,
		"products": productCount,
		"revenue":  totalRevenue,
	})
}

// --- Users (Employees & Clients) ---
func GetUsers(c *gin.Context) {
	var users []models.User
	role := c.Query("role")
	query := db
	if role != "" {
		query = query.Where("role = ?", role)
	}
	if err := query.Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}
	c.JSON(http.StatusOK, users)
}

func CreateUser(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	// Hash password if provided
	if user.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
			return
		}
		user.Password = string(hashedPassword)
	}
	if err := db.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}
	c.JSON(http.StatusCreated, user)
}

func UpdateUser(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}
	var user models.User
	if err := db.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := db.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}
	c.JSON(http.StatusOK, user)
}

func DeleteUser(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}
	if err := db.Unscoped().Delete(&models.User{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "User deleted"})
}

// --- Vouchers ---
func GetVouchers(c *gin.Context) {
	var vouchers []models.Voucher
	if err := db.Find(&vouchers).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch vouchers"})
		return
	}
	c.JSON(http.StatusOK, vouchers)
}
