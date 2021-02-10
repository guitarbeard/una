import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Switch, Redirect, useHistory } from "react-router-dom";
import { Home, Room } from "./Pages";

import "nes.css/css/nes.min.css";
import "./App.css";

const App = () => {
  const history = useHistory(); // remember the history of user navigation

  // defining the routing: (so far) homepage, lobby/room page. else redirect to home page for simplicity
  return (
    <Switch>
      <Route exact path="/">
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
    <header><div className="container"><a href="/"><h1>UNA</h1></a></div></header>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);