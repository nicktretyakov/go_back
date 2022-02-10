import React, { Component, Fragment } from 'react';
import { useParams } from 'react-router';

function withParams(Component) {
  return (props) => <Component {...props} params={useParams()} />;
}

class OneAPI extends Component {
  state = { api: {}, isLoaded: false, error: null };

  componentDidMount() {
    fetch('http://localhost:4000/v1/api/' + this.props.params.id)
      .then((response) => {
        if (response.status !== '200') {
          let err = Error;
          err.message = 'Invalid response code: ' + response.status;
          this.setState({ error: err });
        }
        return response.json();
      })
      .then((json) => {
        this.setState(
          {
            api: json.api,
            isLoaded: true,
          },
          (error) => {
            this.setState({
              isLoaded: true,
              error,
            });
          }
        );
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

export default withParams(OneAPI);
