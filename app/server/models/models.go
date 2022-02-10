package models

import (
	"database/sql"
	"time"
)

// модель для DB
type Models struct {
	DB DBModel
}

// возврат модели db pool
func NewModels(db *sql.DB) Models {
	return Models{
		DB: DBModel{DB: db},
	}
}

type API struct {
	ID          int            `json:"id"`
	Title       string         `json:"title"`
	Description string         `json:"description"`
	Year        int            `json:"year"`
	ReleaseDate time.Time      `json:"release_date"`
	Runtime     int            `json:"runtime"`
	Rating      int            `json:"rating"`
	MPAARating  string         `json:"mpaa_rating"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	APICRM      map[int]string `json:"crms"`
	Poster      string         `json:"poster"`
}

type CRM struct {
	ID        int       `json:"id"`
	CRMName   string    `json:"crm_name"`
	CreatedAt time.Time `json:"-"`
	UpdatedAt time.Time `json:"-"`
}

type APICRM struct {
	ID        int       `json:"-"`
	APIID     int       `json:"-"`
	CRMID     int       `json:"-"`
	CRM       CRM       `json:"crm"`
	CreatedAt time.Time `json:"-"`
	UpdatedAt time.Time `json:"-"`
}

type User struct {
	ID       int
	Email    string
	Password string
}
