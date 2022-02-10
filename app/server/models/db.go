package models

import (
	"context"
	"database/sql"
	"fmt"
	"time"
)

type DBModel struct {
	DB *sql.DB
}

func (m *DBModel) Get(id int) (*API, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `SELECT id, title, description, year, release_date, rating, runtime, mpaa_rating, created_at, updated_at, coalesce(poster, '')
						FROM apis 
						WHERE id = $1`

	row := m.DB.QueryRowContext(ctx, query, id)

	var api API

	err := row.Scan(
		&api.ID,
		&api.Title,
		&api.Description,
		&api.Year,
		&api.ReleaseDate,
		&api.Rating,
		&api.Runtime,
		&api.MPAARating,
		&api.CreatedAt,
		&api.UpdatedAt,
		&api.Poster,
	)

	if err != nil {
		return nil, err
	}

	query = `SELECT mg.id, mg.api_id, mg.crm_id, g.crm_name
					 FROM apis_crms mg
					 LEFT JOIN crms g on (g.id = mg.crm_id)
					 WHERE mg.api_id = $1`

	rows, _ := m.DB.QueryContext(ctx, query, id)
	defer rows.Close()

	crms := make(map[int]string)
	for rows.Next() {
		var mg APICRM
		err := rows.Scan(
			&mg.ID,
			&mg.APIID,
			&mg.CRMID,
			&mg.CRM.CRMName,
		)

		if err != nil {
			return nil, err
		}

		crms[mg.ID] = mg.CRM.CRMName
	}

	api.APICRM = crms

	return &api, nil
}

func (m *DBModel) All(crm ...int) ([]*API, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	where := ""

	if len(crm) > 0 {
		where = fmt.Sprintf("WHERE id in (SELECT api_id FROM apis_crms WHERE crm_id = %d)", crm[0])
	}

	query := fmt.Sprintf(`SELECT id, title, description, year, release_date, rating, runtime, mpaa_rating, created_at, updated_at, coalesce(poster, '') 
	FROM apis %s
	ORDER BY title`, where)

	rows, err := m.DB.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var apis []*API

	for rows.Next() {
		var api API
		err := rows.Scan(
			&api.ID,
			&api.Title,
			&api.Description,
			&api.Year,
			&api.ReleaseDate,
			&api.Rating,
			&api.Runtime,
			&api.MPAARating,
			&api.CreatedAt,
			&api.UpdatedAt,
			&api.Poster,
		)

		if err != nil {
			return nil, err
		}

		crmQuery := `SELECT mg.id, mg.api_id, mg.crm_id, g.crm_name
					 FROM apis_crms mg
					 LEFT JOIN crms g on (g.id = mg.crm_id)
					 WHERE mg.api_id = $1`

		crmRows, _ := m.DB.QueryContext(ctx, crmQuery, api.ID)

		crms := make(map[int]string)
		for crmRows.Next() {
			var mg APICRM
			err := crmRows.Scan(
				&mg.ID,
				&mg.APIID,
				&mg.CRMID,
				&mg.CRM.CRMName,
			)

			if err != nil {
				return nil, err
			}

			crms[mg.ID] = mg.CRM.CRMName
		}

		crmRows.Close()

		api.APICRM = crms
		apis = append(apis, &api)

	}

	return apis, nil
}

func (m *DBModel) CRMSAll() ([]*CRM, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `SELECT id, crm_name, created_at, updated_at
	FROM crms
	ORDER BY crm_name`

	rows, err := m.DB.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var crms []*CRM

	for rows.Next() {
		var g CRM
		err := rows.Scan(
			&g.ID,
			&g.CRMName,
			&g.CreatedAt,
			&g.UpdatedAt,
		)

		if err != nil {
			return nil, err
		}

		crms = append(crms, &g)
	}

	return crms, nil
}

func (m *DBModel) InsertAPI(api API) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	stmt := `INSERT INTO apis (title, description, year, release_date, runtime, rating, mpaa_rating, created_at, updated_at)
						VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`

	_, err := m.DB.ExecContext(ctx, stmt,
		api.Title,
		api.Description,
		api.Year,
		api.ReleaseDate,
		api.Runtime,
		api.Rating,
		api.MPAARating,
		api.CreatedAt,
		api.UpdatedAt,
		api.Poster,
	)

	if err != nil {
		return err
	}

	return nil
}

func (m *DBModel) UpdateAPI(api API) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	stmt := `UPDATE apis SET title = $1, description = $2, year = $3, release_date = $4, runtime = $5, rating = $6, mpaa_rating = $7, updated_at = $8, poster = $9
			WHERE id = $10`

	_, err := m.DB.ExecContext(ctx, stmt,
		api.Title,
		api.Description,
		api.Year,
		api.ReleaseDate,
		api.Runtime,
		api.Rating,
		api.MPAARating,
		api.UpdatedAt,
		api.Poster,
		api.ID,
	)

	if err != nil {
		return err
	}

	return nil
}

func (m *DBModel) DeleteAPI(id int) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	stmt := "DELETE FROM apis where id = $1"

	_, err := m.DB.ExecContext(ctx, stmt, id)
	if err != nil {
		return err
	}

	return nil

}
