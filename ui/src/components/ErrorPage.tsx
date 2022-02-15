import React from 'react';
import { Grid, Paper, Typography, Button, AppBar, Toolbar } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';

export default function Error() {
  return (
    <Grid container className="error-page">
      <AppBar position={'static'} className="header-nav">
        <Toolbar className="toolbar">
          <div className="header-info">
            <Logo size="small" />
            <div className="app-info">
              <Typography variant="h2">Daml Chess</Typography>
            </div>
          </div>
        </Toolbar>
      </AppBar>
      <Paper className="error-content">
        <Typography variant="h1">404</Typography>
        <Typography variant="h2">Oops. Looks like the page you&apos;re looking for no longer exists</Typography>
        <Typography variant="h2">But we&apos;re here to bring you back to safety</Typography>
        <Button variant="contained" component={Link} to="/" size="large">
          Back to Home
        </Button>
      </Paper>
    </Grid>
  );
}
