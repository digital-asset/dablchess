import React, { useState } from 'react';
import { Grid, CircularProgress, Typography, Button, TextField, Fade } from '@material-ui/core';
import {} from 'react-router-dom';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Logo } from '../../components/Logo';
import { useUserDispatch, loginUser, loginDamlHubUser } from '../../context/UserContext';
import { isLocalDev } from '../../config';
import { classes } from '../../components/classes';

function Login({ history }: RouteComponentProps<any>) {
  // global
  var userDispatch = useUserDispatch();

  // local
  var [isLoading, setIsLoading] = useState<boolean>(false);
  var [error, setError] = useState(false);
  var [loginValue, setLoginValue] = useState<string>('');
  var [passwordValue, setPasswordValue] = useState<string>('');

  return (
    <Grid container className={'login'}>
      <div className={classes.logotypeContainer}>
        <Logo />
        <Typography variant="h1">Daml Chess</Typography>
      </div>
      <div className={classes.formContainer}>
        <div className={classes.form}>
          <React.Fragment>
            <Fade in={error}>
              <Typography color="secondary" className={classes.errorMessage}>
                Something is wrong with your login or password :(
              </Typography>
            </Fade>
            {!isLocalDev && (
              <>
                <Button
                  className={classes.damlHubLoginButton}
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={loginDamlHubUser}
                >
                  Log in with Daml Hub
                </Button>
                <Typography>OR</Typography>
              </>
            )}
            <TextField
              id="email"
              InputProps={{
                classes: {
                  underline: classes.textFieldUnderline,
                  input: classes.textField,
                },
              }}
              value={loginValue}
              onChange={(e) => setLoginValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  loginUser(userDispatch, loginValue, passwordValue, history, setIsLoading, setError);
                }
              }}
              margin="normal"
              placeholder="Username"
              type="email"
              fullWidth
            />
            <TextField
              id="password"
              InputProps={{
                classes: {
                  underline: classes.textFieldUnderline,
                  input: classes.textField,
                },
              }}
              value={passwordValue}
              onChange={(e) => setPasswordValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  loginUser(userDispatch, loginValue, passwordValue, history, setIsLoading, setError);
                }
              }}
              margin="normal"
              placeholder="Password"
              type="password"
              fullWidth
            />
            <div className={classes.formButtons}>
              {isLoading ? (
                <CircularProgress size={26} className={classes.loginLoader} />
              ) : (
                <Button
                  disabled={loginValue.length === 0}
                  onClick={() => loginUser(userDispatch, loginValue, passwordValue, history, setIsLoading, setError)}
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
