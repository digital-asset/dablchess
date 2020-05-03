import React from "react";
import Contracts from "../../components/Contracts/Contracts";
import { useStreamQuery } from "@daml/react";
import { ActiveSideOfGame, DrawRequest, GameProposal, GameResult, PassiveSideOfGame } from "@daml-ts/chess-0.3.0/lib/Chess";

export default function GamesTable() {

  const gameProposals = useStreamQuery(GameProposal).contracts;
  const activeGames = useStreamQuery(ActiveSideOfGame).contracts;
  const passiveGames = useStreamQuery(PassiveSideOfGame).contracts
  const drawRequests = useStreamQuery(DrawRequest).contracts;
  const gameResults = useStreamQuery(GameResult).contracts;

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
