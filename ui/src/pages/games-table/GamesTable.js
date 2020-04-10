import React from "react";
import Contracts from "../../components/Contracts/Contracts";
//import { useStreamQuery, useExercise } from "@daml/react";
import { useStreamQuery } from "@daml/react";
import { ActiveSideOfGame, GameProposal, GameResult, PassiveSideOfGame } from "@daml-ts/chess-1.0.0/lib/Chess";

export default function GamesTable() {

  const gameProposals = useStreamQuery(GameProposal);
  const activeGames = useStreamQuery(ActiveSideOfGame);
  const passiveGames = useStreamQuery(PassiveSideOfGame)
  const gameResults = useStreamQuery(GameResult);

  return (
    <>
      <Contracts
        gameProposals={gameProposals.contracts}
        activeGames={activeGames.contracts}
        passiveGames={passiveGames.contracts}
        gameResults={gameResults.contracts}
      />
    </>
  );
}
