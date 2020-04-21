import React, {useEffect, useState} from "react";
import { withRouter } from "react-router-dom";
import { AppBar, Toolbar, IconButton, Typography, TextField } from "@material-ui/core";
import { Menu, ExitToApp, ArrowBack, Refresh } from "@material-ui/icons";
import classNames from "classnames";
import useStyles from "./styles";
import { useLayoutState, useLayoutDispatch, toggleSidebar } from "../../context/LayoutContext";
import { useAliases, useWellKnownParties, useUserState, useUserDispatch, signOut } from "../../context/UserContext";
import { useLedger, useReload } from "@daml/react";
import { AliasRequest } from "@daml-ts/chess-0.2.0/lib/Alias";


function Header({ history }) {
  const classes = useStyles();

  // global
  const layoutState = useLayoutState();
  const layoutDispatch = useLayoutDispatch();
  const userState = useUserState();
  const userDispatch = useUserDispatch();
  const reload = useReload();

  const [alias, setAlias] = useState('')
  const [toAlias, toParty] = useAliases();
  useEffect(() => {
    console.log(`??`);
    setAlias(toAlias(userState.party));
  }, []);

  const wellKnownParties = useWellKnownParties();
  const ledger = useLedger();

  async function onAliasEnter(newAliasValue){
    let args = { user : userState.party
               , alias : newAliasValue
               , operator : wellKnownParties.userAdminParty
               };
    let aliasRequest = await ledger.create(AliasRequest, args);
    console.log(`Sent an aliasRequest ${JSON.stringify(args)} -> ${JSON.stringify(aliasRequest)}`);
    //setAlias(newAliasValue);
  }

  return (
    <AppBar position="fixed" className={classes.appBar}>
      <Toolbar className={classes.toolbar}>
        <IconButton
          color="inherit"
          onClick={() => toggleSidebar(layoutDispatch)}
          className={classNames(classes.headerMenuButton, classes.headerMenuButtonCollapse)}
        >
          {layoutState.isSidebarOpened ? (
            <ArrowBack
              classes={{
                root: classNames(
                  classes.headerIcon,
                  classes.headerIconCollapse,
                ),
              }}
            />
          ) : (
            <Menu
              classes={{
                root: classNames(
                  classes.headerIcon,
                  classes.headerIconCollapse,
                ),
              }}
            />
          )}
        </IconButton>
        <Typography variant="h6" weight="medium" className={classes.logotype}>
          DABL Chess
        </Typography>
        <div className={classes.grow} />
        <TextField
          id="alias"
          InputProps={{
            classes: {
              underline: classes.textFieldUnderline,
              input: classes.textField,
            },
          }}
          // How can I create the effect that this alias has been set?
          value={alias}
          onChange={e => setAlias(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !!e.target.value) {
              onAliasEnter(e.target.value);
            }
          }}
        />
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