import React, { useCallback, useEffect, useState } from "react";
import { Tab} from "@material-ui/core";
import { TabContext, TabList, TabPanel } from "@material-ui/lab";
import { useParty, useStreamQuery } from "@daml/react";
import { ActiveSideOfGame, ActiveMove, ActiveDrawClaim, EndGameProposal, GameProposal, GameResult, PassiveSideOfGame } from "@daml-ts/chess-0.5.0/lib/Chess";
import { GameTabContract } from "../../common";
//import { DisplayableGameContract, GameTabContract } from "../../common";
import GamePage from "./GamePage/GamePage";
import ProposalPage from "./ProposalPage/ProposalPage";
import ResultPage from "./ResultPage/ResultPage";
import { useStyles } from "./styles";

type GameKey = string;
function toGameKey(c:GameTabContract):GameKey{
  switch(c.templateId){
    case GameProposal.templateId:
    case GameResult.templateId:
      return c.payload.proposer + c.payload.opponent + c.payload.gameId;
    default:  // DisplayableGameContract
      let g = c.payload.game;
      return g.proposer + g.opponent + g.gameId;
  }
}

type GameState = Record<GameKey, GameTabContract>
function rf(acc : GameState, c:GameTabContract){
  acc[toGameKey(c)] = c;
  return acc
}

function opponent(currentParty:string, c:GameTabContract){
  switch(c.templateId){
    case GameProposal.templateId:
    case GameResult.templateId:
      return c.payload.proposer === currentParty ? c.payload.opponent : c.payload.proposer;
    default:  // DisplayableGameContract
      let g = c.payload.game;
      return g.proposer === currentParty ? g.opponent : g.proposer;
  } 
}

function gameId(c:GameTabContract){
  switch(c.templateId){
    case GameProposal.templateId:
    case GameResult.templateId:
      return c.payload.gameId;
    default:  // DisplayableGameContract
      return c.payload.game.gameId;
  }
}

function tabLabel(currentParty:string, c:GameTabContract){
  return opponent(currentParty, c) + " " + gameId(c);
}
    
export default function Rootn() {

  const classes = useStyles();
  const party = useParty();

  const [gameMap, setGameMap] = useState<GameState>({});
  // For some arcane React reason, the JSX will not re-render, when just this GameState changes.
  // We'll keep track of an extra parameter of number of updates to trigger the rerender.
  const [gameOs, setGameOs] = useState<number>(0);
  const [selectedTab, setSelectedTab] = useState("");

  const updateState = useCallback(function(contracts:readonly GameTabContract[]){
    // On loading make sure that we select a tab.
    setSelectedTab( currentTab => currentTab === "" && contracts.length > 0 
                                    ? toGameKey(contracts[0])
                                    : currentTab );
    setGameMap( currentGameMap => contracts.reduce(rf, currentGameMap) )
    setGameOs( current => current + contracts.length );
  }, []);

  const activeGames = useStreamQuery(ActiveSideOfGame);
  const activeMoves = useStreamQuery(ActiveMove);
  const activeDraws = useStreamQuery(ActiveDrawClaim);
  const endGameProposals = useStreamQuery(EndGameProposal);
  const gameProposals = useStreamQuery(GameProposal);
  const passiveGames = useStreamQuery(PassiveSideOfGame);
  const gameResults = useStreamQuery(GameResult);

  useEffect(() => {
    if(!activeGames.loading){ updateState( activeGames.contracts ); }
    if(!activeMoves.loading){ updateState( activeMoves.contracts ); }
    if(!activeDraws.loading){ updateState( activeDraws.contracts ); }
    if(!endGameProposals.loading){ updateState( endGameProposals.contracts ); }
    if(!gameProposals.loading){ updateState( gameProposals.contracts ); }
    if(!passiveGames.loading){ updateState( passiveGames.contracts ); }
    if(!gameResults.loading){ updateState( gameResults.contracts ); }

  }, [activeGames, activeMoves, activeDraws, endGameProposals, gameProposals,
      gameResults, passiveGames, updateState]);

  const handleTabSwitch = (ignore: React.ChangeEvent<{}>, newValue: string) => {
    setSelectedTab(newValue);
  };

  function contractToComponent(c:GameTabContract){
    switch (c.templateId){
      case GameProposal.templateId:
        return ( <ProposalPage c={c}/>);
      case GameResult.templateId:
        return ( <ResultPage c={c}/>);
      default:  // DisplayableGameContract
        return ( <GamePage c={c}/>);
    }
  }

  return (
    <>
      <div hidden={true}>{gameOs}</div>
      <TabContext value={selectedTab}>
        <TabList
          onChange={handleTabSwitch}
          className={classes.tabList} >
          {Object.entries(gameMap).map(g =>
            <Tab className={classes.tab}
                key={g[0]}
                value={g[0]}
                label={tabLabel(party,g[1])}
            />
            )}
        </TabList>
        {Object.entries(gameMap).map( g =>
          <TabPanel className={classes.tabPanel} key={g[0]} value={g[0]}>
            {contractToComponent(g[1])}
          </TabPanel>
        )}
      </TabContext>
   </>
  );
}