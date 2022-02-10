import { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';

export default class APIS extends Component {
  state = { apis: [], isLoaded: false, error: null };

  componentDidMount() {
    fetch(`${process.env.REACT_APP_API_URL}/v1/apis`)
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
    const { apis, isLoaded, error } = this.state;

    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <p>Loading...</p>;
    } else {
      return (
        <Fragment>
          <h2>Choose API</h2>

          <div className="list-group">
            {apis.map((m) => (
              <Link
                key={m.id}
                className="list-group-item list-group-item-action"
                to={`/apis/${m.id}`}
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