import React, { useState } from 'react';
import { Grid, CircularProgress, Typography, Button, TextField, Fade } from '@material-ui/core';
import {} from 'react-router-dom';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Logo } from './Logo';
import { useUserDispatch, loginUser, loginDamlHubUser } from '../context/UserContext';
import { isLocalDev } from './../config';

function Login({ history }: RouteComponentProps<any>) {
  // global
  var userDispatch = useUserDispatch();

  // local
  var [isLoading, setIsLoading] = useState<boolean>(false);
  var [error, setError] = useState(false);
  var [loginValue, setLoginValue] = useState<string>('');
  var [passwordValue, setPasswordValue] = useState<string>();

  return (
    <Grid container className="login">
      <div className="logotypeContainer">
        <Logo />
        <Typography variant="h1">Daml Chess</Typography>
      </div>
      <div className="formContainer">
        <div className="form">
          <React.Fragment>
            <Fade in={error}>
              <Typography color="secondary" className="errorMessage">
                Something is wrong with your login or password :(
              </Typography>
            </Fade>
            {!isLocalDev && (
              <>
                <Button
                  className="damlHubLoginButton"
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={loginDamlHubUser}
                >
                  Log in with Daml Hub
                </Button>
                <p>or</p>
              </>
            )}
            <TextField
              id="email"
              value={loginValue}
              onChange={(e) => setLoginValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  loginUser(userDispatch, loginValue, history, setIsLoading, setError, passwordValue);
                }
              }}
              margin="normal"
              placeholder="Username"
              type="email"
              fullWidth
            />
            {!isLocalDev && (
              <TextField
                id="password"
                value={passwordValue}
                onChange={(e) => setPasswordValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    loginUser(userDispatch, loginValue, history, setIsLoading, setError, passwordValue);
                  }
                }}
                margin="normal"
                placeholder="Password"
                type="password"
                fullWidth
              />
            )}
            <div className="formButtons">
              {isLoading ? (
                <CircularProgress size={26} className="loginLoader" />
              ) : (
                <Button
                  disabled={loginValue.length === 0}
                  onClick={() => loginUser(userDispatch, loginValue, history, setIsLoading, setError, passwordValue)}
                  variant="contained"
                  color="primary"
                  size="large"
                >
                  Login
                </Button>
              )}
            </div>
          </React.Fragment>
        </div>
      </div>
    </Grid>
  );
}

export default withRouter(Login);
