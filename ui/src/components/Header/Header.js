import React from "react";
import { withRouter } from "react-router-dom";
import { AppBar, Toolbar, IconButton, Typography } from "@material-ui/core";
import { ExitToApp, Refresh } from "@material-ui/icons";
import useStyles from "./styles";
import { useUserDispatch, useUserState, signOut } from "../../context/UserContext";
import AliasField from "./components/AliasField/AliasField";
import { useReload } from "@daml/react";


function Header({ history }) {
  const classes = useStyles();

  // global
  const userState = useUserState();
  const userDispatch = useUserDispatch();
  const reload = useReload();

  return (
    <AppBar position="fixed" className={classes.appBar}>
      <Toolbar className={classes.toolbar}>
        <Typography variant="h6" weight="medium" className={classes.logotype}>
          DABL Chess
        </Typography>
        <div className={classes.grow} />
        <AliasField />
                                       {/* Do not set this vvvvv one to an Alias */}
        <Typography variant="h6" weight="medium">User: {userState.party}</Typography>
        <IconButton
          color="inherit"
          aria-haspopup="true"
          onClick={reload}
          className={classes.headerMenuButton}
        >
          <Refresh classes={{ root: classes.headerIcon }} />
        </IconButton>
        <IconButton
          aria-haspopup="true"
          color="inherit"
          className={classes.headerMenuButton}
          aria-controls="profile-menu"
          onClick={(event) => signOut(event, userDispatch, history)}
        >
          <ExitToApp classes={{ root: classes.headerIcon }} />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

export default withRouter(Header);