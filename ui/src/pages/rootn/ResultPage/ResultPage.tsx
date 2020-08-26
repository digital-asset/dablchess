import React from "react";
import { GameResult } from "@daml-ts/chess-0.5.0/lib/Chess";
import { useParty } from "@daml/react"

type ResultPageProp = {
  c : GameResult.CreateEvent;
}

export default function ResultPage({c}:ResultPageProp){
  const party = useParty();
  let msg : string;
  switch(c.payload.drawOrWinner.tag){
    case "Draw":
      msg = "Draw by " + c.payload.drawOrWinner.value.tag;
      break;
    case "Winner":
      msg = c.payload.drawOrWinner.value === party ? "You won!" : "You lost.";
  }

  return (
    <>
      <h1>{msg}</h1>
    </>
  );
}