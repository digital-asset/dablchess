import React from 'react';
import Contracts from './Contracts/Contracts';
import { useStreamQuery } from '@daml/react';
import {
  ActiveSideOfGame,
  DrawRequest,
  GameProposal,
  GameResult,
  PassiveSideOfGame,
} from '@daml-ts/chess-0.5.0/lib/Chess';
import { CircularProgress } from '@material-ui/core';

export default function GamesTable() {
  const { loading: loadingGameProposals, contracts: gameProposals } = useStreamQuery(GameProposal);
  const { loading: loadingActiveGames, contracts: activeGames } = useStreamQuery(ActiveSideOfGame);
  const { loading: loadingPassiveGames, contracts: passiveGames } = useStreamQuery(PassiveSideOfGame);
  const { loading: loadingDrawRequests, contracts: drawRequests } = useStreamQuery(DrawRequest);
  const { loading: loadingGameRequests, contracts: gameResults } = useStreamQuery(GameResult);
  if (
    loadingGameProposals ||
    loadingActiveGames ||
    loadingPassiveGames ||
    loadingDrawRequests ||
    loadingGameProposals ||
    loadingGameRequests
  ) {
    return (
      <div className="loading-contracts">
        <CircularProgress color={'inherit'} /> <p>Loading contracts...</p>
      </div>
    );
  }
  return (
    <Contracts
      gameProposals={gameProposals}
      activeGames={activeGames}
      passiveGames={passiveGames}
      drawRequests={drawRequests}
      gameResults={gameResults}
    />
  );
}
