import React, { Component, Fragment } from 'react';
import { useParams } from 'react-router';

function withParams(Component) {
  return (props) => <Component {...props} params={useParams()} />;
}

class OneAPIGraphQL extends Component {
  state = { api: {}, isLoaded: false, error: null };

  componentDidMount() {
    const payload = `
    {
      api(id: ${this.props.params.id}) {
        id
        title
        runtime
        year
        description
        release_date
        rating
        mpaa_rating
        poster
      }
    }`;

    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

    const requestOptions = {
      method: 'POST',
      body: payload,
      headers: myHeaders,
    };

    fetch('http://localhost:4000/v1/graphql', requestOptions)
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          api: data.data.api,
          isLoaded: true,
        });
      }); 
  }

  render() {
    const { api, isLoaded, error } = this.state;

    if (api.crms) {
      api.crms = Object.values(api.crms);
    } else {
      api.crms = [];
    }
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <p>Loading...</p>;
    } else {
      return (
        <Fragment>
          <h2>
            API: {api.title} ({api.year})
          </h2>

          {api.poster !== '' && (
            <div>
              <img
                src={`https://MyDomainName.my.salesforce.com/services/data/v54.0/sobjects/Lead/00Q112222233333/richTextImageFields/LeadPhotoRichText__c/0EMR00000000A8V -H "Authorization: Bearer token" --output "LeadPhoto.jpeg"'${api.poster}`}
                alt="poster"
              />
            </div>
          )}

          <div className="float-start">
            <small>Rating: {api.mpaa_rating}</small>
          </div>
          <div className="float-end">
            {api.crms.map((m, index) => (
              <span className="badge bg-secondary me-1" key={index}>
                {m}
              </span>
            ))}
          </div>
          <div className="clearfix"></div>

          <hr />

          <table className="table table-compact table-striped">
            <thead></thead>
            <tbody>
              <tr>
                <td>
                  <strong>Title:</strong>
                </td>
                <td>{api.title}</td>
              </tr>
              <tr>
                <td>
                  <strong>Description</strong>
                </td>
                <td>
                  <strong>{api.description}</strong>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Run time:</strong>
                </td>
                <td>{api.runtime} minutes</td>
              </tr>
            </tbody>
          </table>
        </Fragment>
      );
    }
  }
}

export default withParams(OneAPIGraphQL);
