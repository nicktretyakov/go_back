import { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';

export default class CRMS extends Component {
  state = {
    crms: [],
    isLoaded: false,
    error: null,
  };

  componentDidMount() {
    fetch('http://localhost:4000/v1/crms')
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
            crms: json.crms,
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
    const { crms, isLoaded, error } = this.state;
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <p>Loading...</p>;
    } else {
      return (
        <Fragment>
          <h2>CRMS</h2>
          <div className="list-group">
            {crms.map((m) => (
              <Link
                key={m.id}
                className="list-group-item list-group-item-action"
                to={`/crm/${m.id}`}
                state={{
                  crmId: m.id,
                  crmName: m.crm_name,
                }}
              >
                {m.crm_name}
              </Link>
            ))}
          </div>
        </Fragment>
      );
    }
  }
}
