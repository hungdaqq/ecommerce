package handlers

import (
	"net/http"
	"strconv"

	"ecommerce-backend/models"

	"github.com/gin-gonic/gin"
)

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
	if err := db.Unscoped().Delete(&models.Blog{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete blog"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Blog deleted"})
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
