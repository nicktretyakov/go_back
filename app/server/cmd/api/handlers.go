package main

import (
	"encoding/json"
	"errors"
	"go_back/app/server/models"
	"io"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"github.com/julienschmidt/httprouter"
)

type jsonResp struct {
	OK      bool   `json:"ok"`
	Message string `json:"message"`
}

func (app *application) getOneAPI(w http.ResponseWriter, r *http.Request) {
	params := httprouter.ParamsFromContext(r.Context())

	id, err := strconv.Atoi(params.ByName("id"))
	if err != nil {
		app.logger.Print(errors.New("invalid id parameter"))
		app.errorJSON(w, err)
		return
	}

	app.logger.Println("id is", id)

	api, err := app.models.DB.Get(id)

	err = app.writeJSON(w, http.StatusOK, api, "api")
	if err != nil {
		app.errorJSON(w, err)
		return
	}
}

func (app *application) getAllAPIS(w http.ResponseWriter, r *http.Request) {
	apis, err := app.models.DB.All()
	if err != nil {
		app.errorJSON(w, err)
		return
	}

	err = app.writeJSON(w, http.StatusOK, apis, "apis")
	if err != nil {
		app.errorJSON(w, err)
		return
	}
}

func (app *application) getAllCRMS(w http.ResponseWriter, r *http.Request) {
	crms, err := app.models.DB.CRMSAll()
	if err != nil {
		app.errorJSON(w, err)
		return
	}

	err = app.writeJSON(w, http.StatusOK, crms, "crms")
	if err != nil {
		app.errorJSON(w, err)
		return
	}
}

func (app *application) getAllAPISByCRM(w http.ResponseWriter, r *http.Request) {
	params := httprouter.ParamsFromContext(r.Context())

	crmID, err := strconv.Atoi(params.ByName("crm_id"))

	if err != nil {
		app.errorJSON(w, err)
		return
	}

	apis, err := app.models.DB.All(crmID)
	if err != nil {
		app.errorJSON(w, err)
		return
	}

	err = app.writeJSON(w, http.StatusOK, apis, "apis")
	if err != nil {
		app.errorJSON(w, err)
		return
	}
}

type APIPayload struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Year        string `json:"year"`
	ReleaseDate string `json:"release_date"`
	Runtime     string `json:"runtime"`
	Rating      string `json:"rating"`
	MPAARating  string `json:"mpaa_rating"`
}

func (app *application) editAPI(w http.ResponseWriter, r *http.Request) {

	var payload APIPayload

	err := json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		app.errorJSON(w, err)
		return
	}

	log.Println(payload.Title)

	var api models.API

	if payload.ID != "0" {
		id, _ := strconv.Atoi(payload.ID)
		m, _ := app.models.DB.Get(id)
		api = *m
		api.UpdatedAt = time.Now()
	}

	api.ID, _ = strconv.Atoi(payload.ID)
	api.Title = payload.Title
	api.Description = payload.Description
	api.ReleaseDate, _ = time.Parse("2022-01-01", payload.ReleaseDate)
	api.Year = api.ReleaseDate.Year()
	api.Runtime, _ = strconv.Atoi(payload.Runtime)
	api.Rating, _ = strconv.Atoi(payload.Rating)
	api.MPAARating = payload.MPAARating
	api.CreatedAt = time.Now()
	api.UpdatedAt = time.Now()

	if api.Poster == "" {
		api = getPoster(api)
	}

	if api.ID == 0 {
		err = app.models.DB.InsertAPI(api)
		if err != nil {
			app.errorJSON(w, err)
			return
		}
	} else {
		err = app.models.DB.UpdateAPI(api)
		if err != nil {
			app.errorJSON(w, err)
			return
		}
	}

	ok := jsonResp{
		OK: true,
	}

	err = app.writeJSON(w, http.StatusOK, ok, "response")
	if err != nil {
		app.errorJSON(w, err)
		return
	}
}

func (app *application) deleteAPI(w http.ResponseWriter, r *http.Request) {
	params := httprouter.ParamsFromContext((r.Context()))

	id, err := strconv.Atoi(params.ByName("id"))
	if err != nil {
		app.errorJSON(w, err)
		return
	}

	err = app.models.DB.DeleteAPI(id)
	if err != nil {
		app.errorJSON(w, err)
		return
	}

	ok := jsonResp{
		OK: true,
	}

	err = app.writeJSON(w, http.StatusOK, ok, "response")
	if err != nil {
		app.errorJSON(w, err)
		return
	}
}

func getPoster(api models.API) models.API {
	type TheAPIDB struct {
		Page    int `json:"page"`
		Results []struct {
			Adult            bool    `json:"adult"`
			BackdropPath     string  `json:"backdrop_path"`
			CRMId            []int   `json:"crm_id"`
			ID               int     `json:"id"`
			OriginalLanguage string  `json:"original_language"`
			OriginalTitle    string  `json:"original_title"`
			Overview         string  `json:"overview"`
			Popularity       float64 `json:"popularity"`
			PosterPath       string  `json:"poster_path"`
			ReleaseDate      string  `json:"release_date"`
			Title            string  `json:"title"`
			VoteAverage      float64 `json:"vote_average"`
			VoteCount        int     `json:"vote_count"`
		} `json:"results"`
		TotalPages   int `json:"total_pages"`
		TotalResults int `json:"total_results"`
	}

	client := &http.Client{}
	key := "ffdabaf9694281e8f9f1707d4826534b"
	theUrl := "https://api.theapidb.org/3/search/api?api_key="
	log.Println(theUrl + key + "&query=" + url.QueryEscape(api.Title))

	req, err := http.NewRequest("GET", theUrl+key+"&query="+url.QueryEscape(api.Title), nil)

	if err != nil {
		log.Println(err)
		return api
	}

	req.Header.Add("Accept", "application/json")
	req.Header.Add("Content-Type", "application/json")
	resp, err := client.Do(req)

	if err != nil {
		log.Println(err)
		return api
	}

	defer resp.Body.Close()
	bodyBytes, err := io.ReadAll(resp.Body)

	if err != nil {
		log.Println(err)
		return api
	}

	var responseObject TheAPIDB

	json.Unmarshal(bodyBytes, &responseObject)

	if len(responseObject.Results) > 0 {
		api.Poster = responseObject.Results[0].PosterPath
	}

	return api
}
