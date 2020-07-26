import React from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { AppBar, Button, IconButton, Toolbar, Typography } from "@material-ui/core";
import { ExitToApp, Refresh } from "@material-ui/icons";
import useStyles from "./styles";
import { useUserDispatch, useUserState, signOut } from "../../context/UserContext";
import { useSessionState } from "../../context/SessionContext";
import AliasField from "./components/AliasField/AliasField";
import NewGameDialog from "./components/NewGameDialog/NewGameDialog";
import { useReload } from "@daml/react";

type NewGameButtonProp = {
  text : string
  onClick : () => void
}

function NewGameButton({text, onClick} : NewGameButtonProp){
  const classes = useStyles();
  return (
    <Button
      className={classes.newGameButton}
      variant="contained"
      onClick={onClick}
      >{text}
    </Button>
  );
}

function Header({ history }: RouteComponentProps<any>) {
  const classes = useStyles();

  // global
  const userState = useUserState();
  const userDispatch = useUserDispatch();
  const reload = useReload();
  const sessionState = useSessionState();
  const [newGameDialogOpen, setOpenNewGameDialog] = React.useState<boolean>(false);
  if(!userState.isAuthenticated){
    return null;
  }

  return (
    <AppBar position="fixed" className={classes.appBar}>
      <Toolbar className={classes.toolbar}>
        <Typography variant="h6" className={classes.logotype}>
          DABL Chess
        </Typography>
        <NewGameButton text="New Game" onClick={()=>setOpenNewGameDialog(true)} />
        <NewGameDialog open={newGameDialogOpen} handleClose={()=>setOpenNewGameDialog(false)}/>
        <div className={classes.grow} />
        <Typography variant="h6" >
          User: {userState.party}       {/* Do not set this one to an Alias */}
        </Typography>
        { sessionState.type === "With"
        ? <AliasField session={sessionState.session} />
        : null
        }
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