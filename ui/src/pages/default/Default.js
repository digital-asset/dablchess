import React from "react";
import Contracts from "../../components/Contracts/Contracts";
import { useQuery } from "@daml/react";
import { GameProposal } from "@daml-ts/chess-1.0.0/lib/Chess";

export default function Default() {

  const gameProposals = useQuery(GameProposal);

  return (<Contracts
            contracts={gameProposals.contracts}
            columns={[
              ["ContractId", "contractId"],
              ["GameId", "payload.gameId"],
              ["Proposer", "payload.proposer"],
              //["Desired Side", "payload.desiredSide"],
              ["Opponent", "payload.opponent"],
              ["Operator", "payload.operator"],
              //["Active", "payload.active"],
            ]}
        />)

}
