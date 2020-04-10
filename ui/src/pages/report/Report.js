import React from "react";
import Contracts from "../../components/Contracts/Contracts";
//import { useStreamQuery, useExercise } from "@daml/react";
import { useStreamQuery, useParty } from "@daml/react";
import { ActiveSideOfGame, GameProposal } from "@daml-ts/chess-1.0.0/lib/Chess";

export default function Report() {

  const activeGames = useStreamQuery(GameProposal);
  const party = useParty();
  console.log("Where's the party at?"+party);
  //const exerciseForfeit = useExercise(ActiveSideOfGame.Forfeit);

  return (
    <>
      <Contracts
        contracts={activeGames.contracts}
        columns={[
          ["ContractId", "contractId"],
          ["GameId", "payload.gameId"],
          ["Proposer", "payload.proposer"],
          ["Side", "payload.desiredSide"],
          ["Opponent", "payload.opponent"],
          ["Operator", "payload.operator"],
          //["Active", "payload.active"],
        ]}
        //actions={[["Forfeit", (c, newOwner) => { exerciseForfeit(c.contractId, { }); }, "New Owner"]]}
      />
    </>
  );
}
