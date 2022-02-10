import { Component, Fragment, useEffect, useState } from 'react';
import { BrowserRouter as Router, Link, Route, Routes } from 'react-router-dom';
import './App.css';
import Admin from './components/Admin';
import EditAPI from './components/EditAPI';
import CRMS from './components/CRMS';
import GraphQL from './components/GraphQL';
import Home from './components/Home';
import Login from './components/Login';
import APIS from './components/APIS';
import OneCRM from './components/OneCRM';
import OneAPI from './components/OneAPI';
import OneAPIGraphQL from './components/OneAPIGraphQL';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      jwt: '',
    };

    this.handleJWTChange(this.handleJWTChange.bind(this));
  }

  componentDidMount() {
    let token = window.localStorage.getItem('jwt');
    if (token) {
      if (this.state.jwt === '') {
        this.setState({ jwt: JSON.parse(token) });
      }
    }
  }

  handleJWTChange = (jwt) => {
    this.setState({ jwt });
  };

  logout = () => {
    this.setState({ jwt: '' });
    window.localStorage.removeItem('jwt');
  };

  render() {
    let loginLink;

    if (this.state.jwt === '') {
      loginLink = <Link to="/login">Login</Link>;
    } else {
      loginLink = (
        <Link to="/logout" onClick={this.logout}>
          Logout
        </Link>
      );
    }

    return (
      <Router>
        <title>HomePage</title>
        <div className="container">
          <div className="row">
            <div className="col mt-3">
              <h1 className="mt-3">WebAdmin</h1>
            </div>
            <div className="col mt-3 text-end">{loginLink}</div>
            <hr className="mb-3"></hr>
          </div>
          <div className="row">
            <div className="col-md-2">
              <nav>
                <ul className="list-group">
                  <li className="list-group-item">
                    <Link to="/">Home</Link>
                  </li>
                  <li className="list-group-item">
                    <Link to="/apis">APIS</Link>
                  </li>
                  <li className="list-group-item">
                    <Link to="/crms">CRMS</Link>
                  </li>
                  {this.state.jwt !== '' && (
                    <Fragment>
                      <li className="list-group-item">
                        <Link to="/admin/api/0">Add</Link>
                      </li>
                      <li className="list-group-item">
                        <Link to="/admin">Manage Catalogue</Link>
                      </li>
                    </Fragment>
                  )}
                  <li className="list-group-item">
                    <Link to="graphql">GraphQL</Link>
                  </li>
                  <li className="list-group-item">
                    <Link to="extras">Exras</Link>
                  </li>
                </ul>
                <pre>{JSON.stringify(this.state, null, 3)}</pre>
              </nav>
            </div>
            <div className="col-md-10">
              <Routes>
                <Route
                  exact
                  path="/login"
                  element={<Login handleJWTChange={this.handleJWTChange} />}
                />
                <Route path="/apis/:id" element={<OneAPI />} />
                <Route
                  path="/apisgraphql/:id"
                  element={<OneAPIGraphQL />}
                />
                <Route path="/apis" element={<APIS />}></Route>
                <Route path="/crm/:id" element={<OneCRM />} />
                <Route exact path="/crms" element={<CRMS />}></Route>
                <Route exact path="/graphql" element={<GraphQL />}></Route>
                <Route
                  exact
                  path="/admin/api/:id"
                  element={<EditAPI jwt={this.state.jwt} />}
                ></Route>
                <Route
                  path="/admin"
                  element={<Admin jwt={this.state.jwt} />}
                ></Route>
                <Route path="/extras" element={<Extras />}></Route>
                <Route path="/" element={<Home />}></Route>
              </Routes>
            </div>
          </div>
        </div>
      </Router>
    );
  }
}

function Extras() {
  const [activeUsers, setActiveUserCount] = useState(0);

  // const counterRef = document.getElementById('counter');

  useEffect(() => {
    // counterRef.innerText = activeUsers;
    
  });

  return (
    <Fragment>
      <button
        className="btn btn-success"
        onClick={() => setActiveUserCount(activeUsers + 1)}
      >
        Add 1 user to count
      </button>
      <button
        className="btn btn-danger ms-2"
        onClick={() => setActiveUserCount(activeUsers - 1)}
      >
        Subtract 1 user from count
      </button>

      <div>{activeUsers} user online</div>
    </Fragment>
  );
}
