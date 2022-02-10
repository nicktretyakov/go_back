package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"go_back/app/server/models"
	"io"
	"log"
	"net/http"
	"strings"

	"github.com/graphql-go/graphql"
)

var apis []*models.API

var fields = graphql.Fields{
	"api": &graphql.Field{
		Type:        apiType,
		Description: "Get api by id",
		Args: graphql.FieldConfigArgument{
			"id": &graphql.ArgumentConfig{
				Type: graphql.Int,
			},
		},
		Resolve: func(p graphql.ResolveParams) (interface{}, error) {
			id, ok := p.Args["id"].(int)
			if ok {
				for _, api := range apis {
					if api.ID == id {
						return api, nil
					}
				}
			}
			return nil, nil
		},
	},
	"list": &graphql.Field{
		Type:        graphql.NewList(apiType),
		Description: "Get all apis",
		Resolve: func(params graphql.ResolveParams) (interface{}, error) {
			return apis, nil
		},
	},
	"search": &graphql.Field{
		Type:        graphql.NewList(apiType),
		Description: "Search apis by title",
		Args: graphql.FieldConfigArgument{
			"titleContains": &graphql.ArgumentConfig{
				Type: graphql.String,
			},
		},
		Resolve: func(params graphql.ResolveParams) (interface{}, error) {
			var theList []*models.API
			search, ok := params.Args["titleContains"].(string)
			if ok {
				for _, currentAPI := range apis {
					if strings.Contains(currentAPI.Title, search) {
						log.Println("Found one")
						theList = append(theList, currentAPI)
					}
				}
			}
			return theList, nil
		},
	},
}

var apiType = graphql.NewObject(
	graphql.ObjectConfig{
		Name: "API",
		Fields: graphql.Fields{
			"id": &graphql.Field{
				Type: graphql.Int,
			},
			"title": &graphql.Field{
				Type: graphql.String,
			},
			"description": &graphql.Field{
				Type: graphql.String,
			},
			"year": &graphql.Field{
				Type: graphql.Int,
			},
			"release_date": &graphql.Field{
				Type: graphql.DateTime,
			},
			"runtime": &graphql.Field{
				Type: graphql.Int,
			},
			"rating": &graphql.Field{
				Type: graphql.Int,
			},
			"mpaa_rating": &graphql.Field{
				Type: graphql.String,
			},
			"created_at": &graphql.Field{
				Type: graphql.DateTime,
			},
			"updated_at": &graphql.Field{
				Type: graphql.DateTime,
			},
			"poster": &graphql.Field{
				Type: graphql.String,
			},
		},
	},
)

func (app *application) apisGraphQL(w http.ResponseWriter, r *http.Request) {
	apis, _ = app.models.DB.All()

	q, _ := io.ReadAll(r.Body)
	query := string(q)

	log.Println(query)

	rootQuery := graphql.ObjectConfig{Name: "RootQuery", Fields: fields}
	schemaConfig := graphql.SchemaConfig{Query: graphql.NewObject(rootQuery)}
	schema, err := graphql.NewSchema(schemaConfig)

	if err != nil {
		app.errorJSON(w, errors.New("failed to create schema"))
		log.Println(err)
		return
	}

	params := graphql.Params{Schema: schema, RequestString: query}
	resp := graphql.Do(params)

	if len(resp.Errors) > 0 {
		app.errorJSON(w, errors.New(fmt.Sprintf("failed: %+v", resp.Errors)))
	}

	j, _ := json.MarshalIndent(resp, "", " ")
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(j)
}
