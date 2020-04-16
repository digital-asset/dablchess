import React from "react";
import { Route, Switch, withRouter } from "react-router-dom";
import classnames from "classnames";
import useStyles from "./styles";
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";
import { useLayoutState } from "../../context/LayoutContext";
import GamesTable from "../../pages/games-table/GamesTable";
import DamlLedger from "@daml/react";
import { useUserState } from "../../context/UserContext";
import { wsBaseUrl, httpBaseUrl } from "../../config";

function Layout() {
  const classes = useStyles();
  const user = useUserState();
  const layoutState = useLayoutState();

  return (
    <DamlLedger party={user.party} token={user.token} httpBaseUrl={httpBaseUrl} wsBaseUrl={wsBaseUrl} >
      <div className={classes.root}>
          <>
            <Header />
            <Sidebar />
            <div
              className={classnames(classes.content, {
                [classes.contentShift]: layoutState.isSidebarOpened,
              })}
            >
              <div className={classes.fakeToolbar} />
              <Switch>
                <Route path="/app/games-table" component={GamesTable} />
              </Switch>
            </div>
          </>
      </div>
    </DamlLedger>
  );
}

export default withRouter(Layout);
