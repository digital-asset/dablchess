
//import { Coord, Piece, PieceType, Side, SplitGameState } from "@daml-ts/chess-0.5.0/lib/Types";
import { SplitGameState } from "@daml-ts/chess-0.5.0/lib/Types";
import { ActiveSideOfGame, ActiveMove, ActiveDrawClaim, EndGameProposal, PassiveSideOfGame} from "@daml-ts/chess-0.5.0/lib/Chess";

export type DisplayableGameContract
    = ActiveSideOfGame.CreateEvent
    | ActiveMove.CreateEvent
    | ActiveDrawClaim.CreateEvent
    | EndGameProposal.CreateEvent
    | PassiveSideOfGame.CreateEvent


export function splitGame(c:DisplayableGameContract):SplitGameState{
  switch(c.templateId){
    case ActiveSideOfGame.templateId:
      return c.payload.active;
    case ActiveMove.templateId:
      return c.payload.active;
    case ActiveDrawClaim.templateId:
      return c.payload.active;
    case EndGameProposal.templateId:
      return c.payload.state.value;   // Does not matter if left or right.
    case PassiveSideOfGame.templateId:
      return c.payload.passive;
  }
}

export type GameKey = string;

export function toGameKey(c:DisplayableGameContract){
  let g = c.payload.game;
  return g.proposer + g.opponent + g.gameId as GameKey;
}

