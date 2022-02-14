import React from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import Header from '../Header/Header';
import GamesTable from '../../pages/games-table/GamesTable';
import Game from '../../pages/game/Game';
import DamlLedger from '@daml/react';
import { useUserState } from '../../context/UserContext';
import { AliasMapProvider } from '../../context/AliasMapContext';
import { DefaultPartiesProvider } from '../../context/DefaultPartiesContext';
import { wsBaseUrl, httpBaseUrl } from '../../config';

function Layout() {
  const user = useUserState();

  if (!user.isAuthenticated) {
    return null;
  }

  return (
    <DamlLedger party={user.party} token={user.token} httpBaseUrl={httpBaseUrl} wsBaseUrl={wsBaseUrl}>
      <DefaultPartiesProvider>
        <AliasMapProvider>
          <div className={'root'}>
            <Header />
            <div>
              <Switch>
                <Route path="/app/games-table" component={GamesTable} />
                <Route path="/app/game/:contractId" component={Game} />
              </Switch>
            </div>
          </div>
        </AliasMapProvider>
      </DefaultPartiesProvider>
    </DamlLedger>
  );
}

export default withRouter(Layout);
