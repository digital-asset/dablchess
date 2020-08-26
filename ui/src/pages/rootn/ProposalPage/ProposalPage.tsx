import React from "react";
import { Button } from "@material-ui/core";
import { GameProposal } from "@daml-ts/chess-0.5.0/lib/Chess";
import { useLedger, useParty } from "@daml/react"

type ProposalPageProp = {
  c : GameProposal.CreateEvent;
}

export default function ProposalPage({c}:ProposalPageProp){
  const party = useParty();
  const ledger = useLedger();
  async function accept(){
    let acceptance = await ledger.exercise(GameProposal.Accept, c.contractId, {});
    console.info(`We accepted ${JSON.stringify(acceptance)}`);
  }

  if(party === c.payload.proposer){
    return (
      <>
        <h1>{`You challenged ${c.payload.opponent} to game "${c.payload.gameId}"`}</h1>
        <div>{"Waiting for acceptance"}</div>
      </>
    );
  } else {
    return (
      <>
        <h1>{`${c.payload.proposer} challenged you to game "${c.payload.gameId}"`}</h1>
        <Button
          color="primary"
          size="small"
          className="px-2"
          variant="contained"
          onClick={accept}
          >Accept
        </Button>
      </>
    );
  }
}