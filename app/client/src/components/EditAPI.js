import React, { Component, Fragment } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import './EditAPI.css';
import Input from './form-components/Input';
import Select from './form-components/Select';
import TextArea from './form-components/TextArea';
import Alert from './ui-components/Alert';

function withParams(Component) {
  return (props) => <Component {...props} params={useParams()} />;
}

class EditAPI extends Component {
  constructor(props) {
    super(props);
    this.state = {
      api: {
        id: 0,
        title: '',
        release_date: '',
        runtime: '',
        mpaa_rating: '',
        rating: '',
        description: '',
      },
      mpaaOptions: [
        {
          id: 'G',
          value: 'G',
        },
        {
          id: 'PG',
          value: 'PG',
        },
        {
          id: 'PG13',
          value: 'PG13',
        },
        {
          id: 'R',
          value: 'R',
        },
        {
          id: 'NC17',
          value: 'NC17',
        },
      ],
      isLoaded: false,
      error: null,
      errors: [],
      alert: {
        type: 'd-none',
        message: '',
      },
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    if (this.props.jwt === '') {
      this.props.history.push({
        pathname: '/login',
      });
      return;
    }

    const id = this.props.params.id;
    if (id > 0) {
      fetch('http://localhost:4000/v1/api/' + id)
        .then((response) => {
          if (response.status !== '200') {
            let err = Error;
            err.Message = 'Invalid response code: ' + response.status;
            this.setState({ error: err });
          }
          return response.json();
        })
        .then((json) => {
          const releaseDate = new Date(json.api.release_date);
          this.setState(
            {
              api: {
                id: id,
                title: json.api.title,
                release_date: releaseDate.toISOString().split('T')[0],
                runtime: json.api.runtime,
                mpaa_rating: json.api.mpaa_rating,
                rating: json.api.rating,
                description: json.api.description,
              },
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
    } else {
      this.setState({ isLoaded: true });
    }
  }

  handleSubmit = (event) => {
    event.preventDefault();

    let errors = [];

    if (this.state.api.title === '') {
      errors.push('title');
    }

    this.setState({ errors });

    if (errors.length > 0) {
      return false;
    }

    const data = new FormData(event.target);
    const payload = Object.fromEntries(data.entries());
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + this.props.jwt);

    const requestOptions = {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: myHeaders,
    };

    fetch('http://localhost:4000/v1/admin/editapi', requestOptions)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (data.error) {
          this.setState({
            alert: { type: 'alert-danger', message: data.error.message },
          });
        } else {
          this.setState({
            alert: { type: 'alert-success', message: 'Changes saved!' },
          });
          // this.props.history.push({
          //   pathname: '/admin',
          // });
        }
      });
  };

  handleChange = (event) => {
    let value = event.target.value;
    let name = event.target.name;
    this.setState((prevState) => ({
      api: {
        ...prevState.api,
        [name]: value,
      },
    }));
  };

  hasError(key) {
    return this.state.errors.indexOf(key) !== -1;
  }

  confirmDelete = (event) => {
    confirmAlert({
      title: 'Delete?',
      message: 'Are you sure?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => {
            const myHeaders = new Headers();
            myHeaders.append('Content-Type', 'application/json');
            myHeaders.append('Authorization', 'Bearer ' + this.props.jwt);

            fetch(
              'http://localhost:4000/v1/admin/deleteapi/' +
                this.state.api.id,
              { method: 'GET', headers: myHeaders }
            )
              .then((response) => response.json)
              .then((data) => {
                if (data.error) {
                  this.setState({
                    alert: {
                      type: 'alert-danger',
                      message: data.error.message,
                    },
                  });
                } else {
                  this.props.history.push({
                    pathname: '/admin',
                  });
                }
              });
          },
        },
        {
          label: 'No',
          onClick: () => {},
        },
      ],
    });
  };

  render() {
    let { api, isLoaded, error } = this.state;

    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <p>Loading...</p>;
    } else {
      return (
        <Fragment>
          <h2>Add/Edit</h2>

          <Alert
            alertType={this.state.alert.type}
            alertMessage={this.state.alert.message}
          />

          <hr />
          <form onSubmit={this.handleSubmit}>
            <input
              type="hidden"
              name="id"
              id="id"
              value={api.id}
              onChange={this.handleChange}
            />

            <Input
              title={'Title'}
              className={this.hasError('title') ? 'is-invalid' : ''}
              type={'text'}
              name={'title'}
              value={api.title}
              handleChange={this.handleChange}
              errorDiv={this.hasError('title') ? 'text-danger' : 'd-none'}
              errorMsg={'Please enter a title'}
            />

            <Input
              title={'Release date'}
              type={'date'}
              name={'release_date'}
              value={api.release_date}
              handleChange={this.handleChange}
            />

            <Input
              title={'Runtime'}
              type={'text'}
              name={'runtime'}
              value={api.runtime}
              handleChange={this.handleChange}
            />

            <Select
              title={'MPAA Rating'}
              name={'mpaa_rating'}
              options={this.state.mpaaOptions}
              value={api.mpaa_rating}
              handleChange={this.handleChange}
              placeholder={'Choose...'}
            />

            <Input
              title={'Rating'}
              type={'text'}
              name={'rating'}
              value={api.rating}
              handleChange={this.handleChange}
            />

            <TextArea
              title={'Description'}
              name={'description'}
              value={api.description}
              rows={'3'}
              handleChange={this.handleChange}
            />

            <hr />

            <button className="btn btn-primary">Save</button>
            <Link to="/admin" className="btn btn-warning ms-1">
              Cancel
            </Link>
            {api.id > 0 && (
              <a
                href="#!"
                onClick={() => this.confirmDelete()}
                className="btn btn-danger ms-1"
              >
                Delete
              </a>
            )}
          </form>

          <div className="mt-3">
            <pre>{JSON.stringify(this.state, null, 3)}</pre>
          </div>
        </Fragment>
      );
    }
  }
}

export default withParams(EditAPI);
