import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Switch, Redirect, useHistory } from "react-router-dom";
import { Home, Room } from "./Pages";

import "./App.css";

const App = () => {
  const history = useHistory(); // remember the history of user navigation

  // defining the routing: (so far) homepage, lobby/room page. else redirect to home page for simplicity
  return (
    <Switch>
      <Route exact path="/">
        <Home history={history} />
      </Route>
      <Route exact path="/join/:joinID">
        <Home history={history} />
      </Route>
      <Route exact path="/rooms/:id">
        <Room history={history} />
      </Route>
      <Redirect to="/" />
    </Switch>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <header>
      <nav>
        <div className="nav-wrapper cyan">
            <div className="row">
                <div className="col s12">
                    <a href="/" className="brand-logo center">UNA</a>
                </div>
            </div>
        </div>
      </nav>
    </header>
    <h1 className="sr-only">UNA</h1>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);