import React, { useEffect }from "react";
import { HashRouter, Redirect, Route, Switch, } from "react-router-dom";
import Layout from "./Layout/Layout";
import Error from "../pages/error/Error";
import Login from "../pages/login/Login";
import { useUserState, useUserDispatch } from "../context/UserContext";

export default function App() {
  const gamesTablePath = "/app/games-table";
  const userState = useUserState();

  return (
    <HashRouter>
      <Switch>
        <Route exact path="/" component={RootRoute} />
        <Route
          exact
          path="/app"
          render={() => <Redirect to={gamesTablePath} />}
        />
        <PrivateRoute path="/app" />
        <PublicRoute path="/login" />
        <Route component={Error} />
      </Switch>
    </HashRouter>
  );

  // #######################################################################

  function RootRoute() {
    const userDispatch = useUserDispatch();

    useEffect(() => {
      const url = new URL(window.location.toString());
      const token = url.searchParams.get('token');
      if (token === null) {
        return;
      }
      const party = url.searchParams.get('party');
      if (party === null) {
        console.log("When 'token' is passed via URL, 'party' must be passed too.");
        throw Error();
      }
      localStorage.setItem("daml.party", party);
      localStorage.setItem("daml.token", token);

      userDispatch({ type: "LOGIN_SUCCESS", token, party });
    })

    return (
      <Redirect to={gamesTablePath} />
    )
  }
  function PrivateRoute({ ...rest } ) {
    return (
      <Route
        {...rest}
        render={props =>
          userState.isAuthenticated ? (
            <Layout {... props}/>
          ) : (
            <Redirect
              to={{
                pathname: "/login",
                state: {
                  from: props.location,
                },
              }}
            />
          )
        }
      />
    );
  }

  function PublicRoute({ ...rest }) {
    return (
      <Route
        {...rest}
        render={props =>
          userState.isAuthenticated ? (
            <Redirect
              to={{
                pathname: "/",
              }}
            />
          ) : (
            <Login {...props}/>
          )
        }
      />
    );
  }
}
