import React, {useEffect, useState} from "react";
import { useStreamQuery } from "@daml/react";
import { ActiveSideOfGame, ActiveMove, ActiveDrawClaim, EndGameProposal, PassiveSideOfGame } from "@daml-ts/chess-0.5.0/lib/Chess";
//import { List, ListItem } from "@material-ui/core";
import { DisplayableGameContract, GameKey, toGameKey } from "../../common";
import GamePage from "../../components/GamePage/GamePage";

type GameState = Record<GameKey, DisplayableGameContract>
export function rf(acc : GameState, c:DisplayableGameContract){
  acc[toGameKey(c)] = c;
  return acc
}

export default function Rootn() {

  const [gameMap, setGameMap] = useState<GameState>({});
  // For some arcane React reason, the JSX will not re-render, when just this GameState changes.
  // We'll keep track of an extra parameter of number of updates to trigger the rerender.
  const [gameOs, setGameOs] = useState<number>(0);

  const activeGames = useStreamQuery(ActiveSideOfGame);
  useEffect(() => {
    if(!activeGames.loading){
      setGameMap( currentGameMap => activeGames.contracts.reduce(rf, currentGameMap) )
      setGameOs( current => current + activeGames.contracts.length );
    }
  }, [activeGames]);

  const activeMoves = useStreamQuery(ActiveMove);
  useEffect(() => {
    if(!activeMoves.loading){
      setGameMap( currentGameMap => activeMoves.contracts.reduce(rf, currentGameMap) )
      setGameOs( current => current + activeMoves.contracts.length );
    }
  }, [activeMoves]);

  const activeDraws = useStreamQuery(ActiveDrawClaim);
  useEffect(() => {
    if(!activeDraws.loading){
      setGameMap( currentGameMap => activeDraws.contracts.reduce(rf, currentGameMap) )
      setGameOs( current => current + activeDraws.contracts.length );
    }
  }, [activeDraws]);

  const endGameProposals = useStreamQuery(EndGameProposal);
  useEffect(() => {
    if(!endGameProposals.loading){
      setGameMap( currentGameMap => endGameProposals.contracts.reduce(rf, currentGameMap) )
      setGameOs( current => current + endGameProposals.contracts.length );
    }
  }, [endGameProposals]);

  const passiveGames = useStreamQuery(PassiveSideOfGame);
  useEffect(() => {
    if(!passiveGames.loading){
      setGameMap( currentGameMap => passiveGames.contracts.reduce(rf, currentGameMap) )
      setGameOs( current => current + passiveGames.contracts.length );
    }
  }, [gameMap, passiveGames]);

  return (
    <>
      <div hidden={true}>{gameOs}</div>
      <ol>
        {Object.entries(gameMap).map(g =>
          <li key={g[0]}>
            <div>
              {g[1].contractId}
            </div>
            <GamePage c={g[1]}/>
          </li>
        ) }
      </ol>
    </>
  );
}