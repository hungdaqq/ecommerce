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
	if err := db.Delete(&models.User{}, id).Error; err != nil {
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

func CreateVoucher(c *gin.Context) {
	var voucher models.Voucher
	if err := c.ShouldBindJSON(&voucher); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := db.Create(&voucher).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create voucher"})
		return
	}
	c.JSON(http.StatusCreated, voucher)
}

func UpdateVoucher(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid voucher ID"})
		return
	}
	var voucher models.Voucher
	if err := db.First(&voucher, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Voucher not found"})
		return
	}
	if err := c.ShouldBindJSON(&voucher); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := db.Save(&voucher).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update voucher"})
		return
	}
	c.JSON(http.StatusOK, voucher)
}

func DeleteVoucher(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid voucher ID"})
		return
	}
	if err := db.Delete(&models.Voucher{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete voucher"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Voucher deleted"})
}

// --- Public Blog Routes ---
func GetPublishedBlogs(c *gin.Context) {
	var blogs []models.Blog
	if err := db.Where("published = ?", true).Find(&blogs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch blogs"})
		return
	}
	c.JSON(http.StatusOK, blogs)
}

func GetPublishedBlog(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid blog ID"})
		return
	}
	var blog models.Blog
	if err := db.Where("id = ? AND published = ?", id, true).First(&blog).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Blog not found"})
		return
	}
	c.JSON(http.StatusOK, blog)
}

// --- Blogs ---
func GetBlogs(c *gin.Context) {
	var blogs []models.Blog
	if err := db.Find(&blogs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch blogs"})
		return
	}
	c.JSON(http.StatusOK, blogs)
}

func CreateBlog(c *gin.Context) {
	var blog models.Blog
	if err := c.ShouldBindJSON(&blog); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := db.Create(&blog).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create blog"})
		return
	}
	c.JSON(http.StatusCreated, blog)
}

func UpdateBlog(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid blog ID"})
		return
	}
	var blog models.Blog
	if err := db.First(&blog, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Blog not found"})
		return
	}
	if err := c.ShouldBindJSON(&blog); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := db.Save(&blog).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update blog"})
		return
	}
	c.JSON(http.StatusOK, blog)
}

func DeleteBlog(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid blog ID"})
		return
	}
	if err := db.Delete(&models.Blog{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete blog"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Blog deleted"})
}
