import React, { useEffect } from 'react';
import { HashRouter, Redirect, Route, Switch } from 'react-router-dom';
import Layout from './Layout/Layout';
import Error from '../pages/error/Error';
import Login from '../pages/login/Login';
import { useUserState, useUserDispatch } from '../context/UserContext';
import jwt_decode from 'jwt-decode';

export default function App() {
  const gamesTablePath = '/app/games-table';
  const userState = useUserState();

  return (
    <HashRouter>
      <Switch>
        <Route exact path="/" component={RootRoute} />
        <Route exact path="/app" render={() => <Redirect to={gamesTablePath} />} />
        <PrivateRoute path="/app" />
        <PublicRoute path="/login" />
        <Route component={Error} />
      </Switch>
    </HashRouter>
  );

  // #######################################################################

  function RootRoute() {
    var userDispatch = useUserDispatch();

    useEffect(() => {
      const url = new URL(window.location.toString());
      const tokenCookiePair =
        document.cookie.split('; ').find((row) => row.startsWith('DAMLHUB_LEDGER_ACCESS_TOKEN')) || '';
      const tokenCookieSecret = tokenCookiePair.slice(tokenCookiePair.indexOf('=') + 1);

      const token = tokenCookieSecret || localStorage.getItem('daml.token');
      if (!token) {
        return undefined;
      }

      const party = partyFromToken(token) || localStorage.getItem('daml.party');
      if (!party) {
        return undefined;
      }

      localStorage.setItem('daml.token', token);
      localStorage.setItem('daml.party', party);

      userDispatch({ type: 'LOGIN_SUCCESS', token, party });
    });

    return <Redirect to={gamesTablePath} />;
  }
  function PrivateRoute({ ...rest }) {
    return (
      <Route
        {...rest}
        render={(props) =>
          userState.isAuthenticated ? (
            <Layout {...props} />
          ) : (
            <Redirect
              to={{
                pathname: '/login',
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
        render={(props) =>
          userState.isAuthenticated ? (
            <Redirect
              to={{
                pathname: '/',
              }}
            />
          ) : (
            <Login {...props} />
          )
        }
      />
    );
  }
}

const partyFromToken = (token: string): string | undefined => {
  try {
    const decoded: any = jwt_decode(token);
    return decoded['https://daml.com/ledger-api'].actAs.shift();
  } catch (e) {
    console.log(e.message || 'failed to extract party from jwt token');
    return undefined;
  }
};
