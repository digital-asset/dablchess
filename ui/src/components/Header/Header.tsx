import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Toolbar, Typography, Button } from '@material-ui/core';
import { ExitToApp } from '@material-ui/icons';
import { useUserDispatch, useUserState, signOut } from '../../context/UserContext';
import AliasField from '../AliasField';
import { Logo } from '../Logo';

function Header({ history }: RouteComponentProps<any>) {
  // global
  const userState = useUserState();
  const userDispatch = useUserDispatch();

  if (!userState.isAuthenticated) {
    return null;
  }

  return (
    <div className={'header-nav'}>
      <Toolbar className={'toolbar'}>
        <div className="header-info">
          <Logo size="small" />
          <div className="app-info">
            <Typography variant="h2">Daml Chess</Typography>
            <p className="p2">
              Welcome to Daml Chess! Daml Chess is a fog-of-war variant of Chess where you see only your pieces and
              where they can move. We demonstrate the power of Daml as the state of the two sides are encoded in
              separate smart contracts; what you know depends on DAML's ledger model, but you can still play via an
              intermediary.
            </p>
          </div>
          <Button className="exit-button" onClick={(event) => signOut(event, userDispatch, history)}>
            <ExitToApp classes={{ root: 'headerIcon' }} /> &nbsp; Exit
          </Button>
        </div>
        <div className="header-info controls">
          <AliasField />
        </div>
      </Toolbar>
    </div>
  );
}

export default withRouter(Header);
