import React, { Component, Fragment } from 'react';
import { useLocation } from 'react-router';
import { Link } from 'react-router-dom';

function withParams(Component) {
  return (props) => <Component {...props} params={useLocation()} />;
}

class OneCRM extends Component {
  state = {
    apis: [],
    isLoaded: false,
    error: null,
    crmName: '',
  };

  componentDidMount() {
    fetch('http://localhost:4000/v1/apis/' + this.props.params.state.crmId)
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
            apis: json.apis,
            isLoaded: true,
            crmName: this.props.params.state.crmName,
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
    let { apis, isLoaded, error, crmName } = this.state;

    if (!apis) {
      apis = [];
    }

    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <p>Loading...</p>;
    } else {
      return (
        <Fragment>
          <h2>CRM: {crmName}</h2>
          <div className="list-group">
            {apis.map((m) => (
              <Link
                to={`/apis/${m.id}`}
                className="list-group-item list-group-item-action"
                id={m.index}
              >
                {m.title}
              </Link>
            ))}
          </div>
        </Fragment>
      );
    }
  }
}

export default withParams(OneCRM);
