import React from "react";
import { Route, Switch, withRouter } from "react-router-dom";
import classnames from "classnames";
import useStyles from "./styles";
import Header from "../Header/Header";
import GamesTable from "../../pages/games-table/GamesTable";
import DamlLedger from "@daml/react";
import { useUserState } from "../../context/UserContext";
import { AliasMapProvider } from "../../context/AliasMapContext";
import { WellKnownPartiesProvider } from "../../context/WellKnownPartiesContext";
import { wsBaseUrl, httpBaseUrl } from "../../config";

function Layout() {
  const classes = useStyles();
  const user = useUserState();
  if(!user.isAuthenticated){
    return null;
  }

  return (
    <DamlLedger party={user.party} token={user.token} httpBaseUrl={httpBaseUrl} wsBaseUrl={wsBaseUrl} >
      <WellKnownPartiesProvider>
        <AliasMapProvider>
          <div className={classes.root}>
              <>
                <Header/>
                <div className={classnames(classes.content, { [classes.contentShift]: false })} >
                  <div className={classes.fakeToolbar} />
                  <Switch>
                    <Route path="/app/games-table" component={GamesTable} />
                  </Switch>
                </div>
              </>
          </div>
        </AliasMapProvider>
      </WellKnownPartiesProvider>
    </DamlLedger>
  );
}

export default withRouter(Layout);
