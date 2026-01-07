package models

import (
	"time"

	"gorm.io/gorm"
)

type Blog struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Title     string         `json:"title" gorm:"not null;column:title"`
	Excerpt   string         `json:"excerpt" gorm:"column:excerpt"`
	Content   string         `json:"content" gorm:"type:text;column:content"`
	Author    string         `json:"author" gorm:"not null;column:author"`
	ImageURL  string         `json:"image_url" gorm:"column:image_url"`
	Published bool           `json:"published" gorm:"default:false;column:published"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}
