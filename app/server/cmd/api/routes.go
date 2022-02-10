package main

import (
	"context"
	"net/http"

	"github.com/julienschmidt/httprouter"
	"github.com/justinas/alice"
)

func (app *application) wrap(next http.Handler) httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
		ctx := context.WithValue(r.Context(), "params", ps)
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}

func (app *application) routes() http.Handler {

	router := httprouter.New()

	secure := alice.New(app.checkToken)

	router.HandlerFunc(http.MethodGet, "/status", app.statusHandler)

	router.HandlerFunc(http.MethodPost, "/v1/graphql", app.apisGraphQL)

	router.HandlerFunc(http.MethodPost, "/v1/signin", app.Signin)

	router.HandlerFunc(http.MethodGet, "/v1/api/:id", app.getOneAPI)
	router.HandlerFunc(http.MethodGet, "/v1/apis", app.getAllAPIS)
	router.HandlerFunc(http.MethodGet, "/v1/apis/:crm_id", app.getAllAPISByCRM)

	router.HandlerFunc(http.MethodGet, "/v1/crms", app.getAllCRMS)

	router.POST("/v1/admin/editapi", app.wrap(secure.ThenFunc(app.editAPI)))
	router.GET("/v1/admin/deleteapi/:id", app.wrap(secure.ThenFunc(app.deleteAPI)))

	return app.enableCORS(router)
}
