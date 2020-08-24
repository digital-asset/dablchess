import React from "react";
import { Route, Switch, withRouter } from "react-router-dom";
import classnames from "classnames";
import useStyles from "./styles";
import Header from "../Header/Header";
import Root from "../../pages/root/Root";
import Rootn from "../../pages/rootn/Rootn";
import DamlLedger from "@daml/react";
import { useUserState } from "../../context/UserContext";
import { SessionProvider } from "../../context/SessionContext";
import { AliasesContextProvider } from "../../context/AliasesContext";
import { wsBaseUrl, httpBaseUrl } from "../../config";

function Layout() {
  const classes = useStyles();
  const user = useUserState();
  if(!user.isAuthenticated){
    return null;
  } else {
    return (
      <DamlLedger party={user.party} token={user.token} httpBaseUrl={httpBaseUrl} wsBaseUrl={wsBaseUrl} >
        <SessionProvider>
          <AliasesContextProvider>
            <div className={classes.root}>
              <>
                <Header/>
                <div className={classnames(classes.content, { [classes.contentShift]: false })} >
                  <div className={classes.fakeToolbar} />
                  <Switch>
                    <Route path="/app/n" component={Rootn} />
                    <Route path="/app" component={Root} />
                  </Switch>
                </div>
              </>
            </div>
          </AliasesContextProvider>
        </SessionProvider>
      </DamlLedger>
    );
  }
}

export default withRouter(Layout);
