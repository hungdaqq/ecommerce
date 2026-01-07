package handlers

import (
	"net/http"
	"strconv"

	"ecommerce-backend/models"

	"github.com/gin-gonic/gin"
)

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
	if err := db.Unscoped().Delete(&models.Voucher{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete voucher"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Voucher deleted"})
}
