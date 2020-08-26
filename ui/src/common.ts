
import { ActiveSideOfGame, ActiveMove, ActiveDrawClaim, EndGameProposal, GameProposal, GameResult, PassiveSideOfGame } from "@daml-ts/chess-0.5.0/lib/Chess";


export type DisplayableGameContract
  = ActiveSideOfGame.CreateEvent
  | ActiveMove.CreateEvent
  | ActiveDrawClaim.CreateEvent
  | EndGameProposal.CreateEvent
  | PassiveSideOfGame.CreateEvent

export type GameTabContract
  = DisplayableGameContract
  | GameProposal.CreateEvent
  | GameResult.CreateEvent

