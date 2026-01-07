package models

import (
	"time"

	"gorm.io/gorm"
)

type Voucher struct {
	ID            uint           `json:"id" gorm:"primaryKey"`
	Code          string         `json:"code" gorm:"unique;not null"`
	Description   string         `json:"description"`
	DiscountType  string         `json:"discount_type"` // "percentage" or "fixed"
	DiscountValue float64        `json:"discount_value"`
	MinOrderValue float64        `json:"min_order_value"`
	MaxDiscount   float64        `json:"max_discount"`
	UsageLimit    int            `json:"usage_limit"`
	UsedCount     int            `json:"used_count" gorm:"default:0"`
	ExpiresAt     *time.Time     `json:"expires_at"`
	IsActive      bool           `json:"is_active" gorm:"default:true"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `json:"-" gorm:"index"`
}
