import React from "react";
import { CreateEvent } from "@daml/ledger";
import { useLedger } from "@daml/react";
import { Button, ButtonGroup, Grid, Table, TableHead, TableRow, TableCell , TableBody } from "@material-ui/core";
import { useStyles } from "./styles";
import { ActiveSideOfGame, DrawRequest, GameProposal, PassiveSideOfGame, GameResult } from "@daml-ts/chess-0.3.0/lib/Chess";
import { useUserState } from "../../context/UserContext";
import { useAliasMaps } from "../../context/AliasMapContext";
import ChessBoardDialog from "./components/ChessBoardDialog/ChessBoardDialog";

type MyButtonProp = {
  text : any
  onClick : () => void
}

function MyButton({text, onClick}:MyButtonProp) {
  return  (<Button
            color="primary"
            size="small"
            className="px-2"
            variant="contained"
            onClick={onClick}
            >{text}
          </Button>
  );
}

type CreateEvent_<T extends object> = CreateEvent<T, any, any>
type GameProposalRowProp = {
  createGp : CreateEvent_<GameProposal>
}

function GameProposalRow({createGp} : GameProposalRowProp) {
  console.log(`Converting a gameProposal ${createGp.contractId}.`);
  let gp = createGp.payload;

  const userState = useUserState();
  const classes = useStyles();
  const ledger = useLedger();
  const aliasMap = useAliasMaps();

  async function acceptGameProposal(){
    console.log("Accepting game proposal:" + createGp.contractId);
    const [choiceReturnValue, events] = await ledger.exercise(GameProposal.Accept, createGp.contractId, {});
    console.log(`After accepting game proposal ${JSON.stringify(choiceReturnValue)} ${JSON.stringify(events)}`);
  }

  return (
      <TableRow className={classes.tableRow}>
        <TableCell className={classes.tableCell}>{gp.gameId}</TableCell>
        <TableCell className={classes.tableCell}>{gp.desiredSide}</TableCell>
        <TableCell className={classes.tableCell}>{aliasMap.toAlias( userState.party === gp.opponent ? gp.proposer : gp.opponent)}</TableCell>
        { userState.party === gp.opponent
        ? (<TableCell className={classes.tableCell}>
            <MyButton text="Accept" onClick={acceptGameProposal} />
          </TableCell>)
        : (<TableCell className={classes.tableCell}>Waiting for {aliasMap.toAlias(gp.opponent)} to accept game request.</TableCell>)
        }
      </TableRow>
  );
}

type ActiveSideofGameRowProp = {
  createAs : CreateEvent_<ActiveSideOfGame>
}

function ActiveSideOfGameRow({createAs} : ActiveSideofGameRowProp) {
  console.log(`Converting an active side of game ${createAs.contractId}.`);
  let ap = createAs.payload;

  const classes = useStyles();
  const ledger = useLedger();
  const aliasMap = useAliasMaps();
  const [openChessBoard, setOpenChessBoard] = React.useState(false);

  function handleClose() {
    setOpenChessBoard(false);
  };

  function move(){
    setOpenChessBoard(true);
  }

  async function claimDraw(){
    console.log("claiming a draw " + createAs.contractId);
    const [choiceReturnValue, events] = await ledger.exercise(ActiveSideOfGame.ClaimDraw, createAs.contractId, {});
    console.log(`After claiming draw ${JSON.stringify(choiceReturnValue)} ${JSON.stringify(events)}`);

  }
  async function forfeit(){
    console.log("forfeiting " + createAs.contractId);
    const [choiceReturnValue, events] = await ledger.exercise(ActiveSideOfGame.Forfeit, createAs.contractId, {});
    console.log(`After forfeiting ${JSON.stringify(choiceReturnValue)} ${JSON.stringify(events)}`);
  }

  return (
    <>
      <ChessBoardDialog open={openChessBoard} side={ap.side} onClose={handleClose} game={ap.active} c={{kind:"active", contractId:createAs.contractId}} />
      <TableRow className={classes.tableRow}>
        <TableCell className={classes.tableCell}>{ap.gameId}</TableCell>
        <TableCell className={classes.tableCell}>{ap.side}</TableCell>
        <TableCell className={classes.tableCell}>{aliasMap.toAlias(ap.opponent)}</TableCell>
        <TableCell className={classes.tableCell}>
          <ButtonGroup>
            <MyButton text="Move" onClick={move}/>
            <MyButton text="Claim Draw" onClick={claimDraw}/>
            <MyButton text="Forfeit" onClick={forfeit}/>
          </ButtonGroup>
        </TableCell>
      </TableRow>
    </>
  )
}

type PassiveSideOfGameRowProp = {
  createPs : CreateEvent_<PassiveSideOfGame>
}

function PassiveSideOfGameRow({createPs} : PassiveSideOfGameRowProp) {
  console.log(`Converting an passive side of game ${createPs.contractId}.`);
  let pp = createPs.payload;

  const classes = useStyles();
  const ledger = useLedger();
  const aliasMap = useAliasMaps();

  async function askForADraw(){
    console.log("asking for a draw " + createPs.contractId);
    const [choiceReturnValue, events] = await ledger.exercise(PassiveSideOfGame.AskForADraw, createPs.contractId, {});
    console.log(`After asking for a draw ${JSON.stringify(choiceReturnValue)} ${JSON.stringify(events)}`);
  }

  async function resign(){
    console.log("resigning " + createPs.contractId);
    const [choiceReturnValue, events] = await ledger.exercise(PassiveSideOfGame.Resign, createPs.contractId, {});
    console.log(`After resigning ${JSON.stringify(choiceReturnValue)} ${JSON.stringify(events)}`);
  }

  const [openChessBoard, setOpenChessBoard] = React.useState(false);

  function handleClose() {
    setOpenChessBoard(false);
  };

  function onClick(){
    setOpenChessBoard(true);
  }

  return (
    <>
      <ChessBoardDialog open={openChessBoard} side={pp.side} onClose={handleClose} game={pp.passive} c={{kind:"passive", contractId:createPs.contractId}} />
      <TableRow className={classes.tableRow} onClick={onClick}>
        <TableCell className={classes.tableCell}>{pp.gameId}</TableCell>
        <TableCell className={classes.tableCell}>{pp.side}</TableCell>
        <TableCell className={classes.tableCell}>{aliasMap.toAlias(pp.opponent)}</TableCell>
        <TableCell className={classes.tableCell}>
          Waiting for {aliasMap.toAlias(pp.opponent)}'s move.
          <ButtonGroup>
            <MyButton text="Ask for a draw" onClick={askForADraw} />
            <MyButton text="Resign" onClick={resign} />
          </ButtonGroup>
        </TableCell>
      </TableRow>
    </>
  );
}

type DrawRequestRowProp = {
  createDr : CreateEvent_<DrawRequest>
}

function DrawRequestRow({createDr} : DrawRequestRowProp) {
  console.log(`Converting an draw request ${createDr.contractId}.`);
  let dp = createDr.payload;

  const classes = useStyles();
  const ledger = useLedger();
  const userState = useUserState();
  const aliasMap = useAliasMaps();

  async function accept(){
    console.log("accepting draw " + createDr.contractId);
    const [choiceReturnValue, events] = await ledger.exercise(DrawRequest.AcceptDrawRequest, createDr.contractId, {});
    console.log(`After accepting draw ${JSON.stringify(choiceReturnValue)} ${JSON.stringify(events)}`);
  }

  return (
    <>
      <TableRow className={classes.tableRow}>
        <TableCell className={classes.tableCell}>{dp.gameId}</TableCell>
        <TableCell className={classes.tableCell}>{dp.side}</TableCell>
        { userState.party === dp.opponent
        ? <TableCell className={classes.tableCell}>{aliasMap.toAlias(dp.requester)}</TableCell>
        : <TableCell className={classes.tableCell}>{aliasMap.toAlias(dp.opponent)}</TableCell>
        }
        { userState.party === dp.opponent
        ? (<TableCell className={classes.tableCell}>
            {aliasMap.toAlias(dp.requester)} requested a draw:
            <ButtonGroup>
              <MyButton text="Accept" onClick={accept} />
            </ButtonGroup>
          </TableCell>)
        : (<TableCell className={classes.tableCell}>You requested a draw.</TableCell>)
        }
      </TableRow>
    </>
  );
}

type GameResultRowProp = {
  createGr : CreateEvent_<GameResult>
}

function GameResultRow({createGr} : GameResultRowProp) {
  console.log(`Converting a gameResult ${createGr.contractId}.`);

  const classes = useStyles();
  const userState = useUserState();
  const aliasMap = useAliasMaps();
  let gp = createGr.payload;
  let gameState="No winner!";
  switch(gp.drawOrWinner.tag){
    case "Winner":
      gameState = gp.drawOrWinner.value + " won!";
      break;
    case "Draw":
      switch(gp.drawOrWinner.value.tag){
        case "PlayerDraw":
          let drawRequester = gp.drawOrWinner.value.value;
          if(drawRequester === userState.party){
            gameState = "Your draw was accepted.";
          } else{
            gameState = `You accepted ${drawRequester}'s draw offer`;
          }
          break;
        case "Stalemate":
          gameState = "Stalemate";
          break;
        case "ThreefoldRepetition":
          gameState = "Draw, three fold repition.";
          break;
        case "FiftyMoveRule":
          gameState = "Draw, fifty non capturing nor pawn.";
          break;
      };
      break;
  };
  return (
      <TableRow className={classes.tableRow}>
        <TableCell className={classes.tableCell}>{gp.gameId}</TableCell>
        <TableCell className={classes.tableCell}></TableCell>
        <TableCell className={classes.tableCell}>{gp.opponent === userState.party ? aliasMap.toAlias(gp.proposer) : aliasMap.toAlias(gp.opponent)}</TableCell>
        <TableCell className={classes.tableCell}>{gameState}</TableCell>
      </TableRow>
  );
}

type ContractsProp<K, I> = {
  gameProposals : readonly CreateEvent_<GameProposal>[]
  activeGames : readonly CreateEvent_<ActiveSideOfGame>[]
  passiveGames : readonly CreateEvent_<PassiveSideOfGame>[]
  drawRequests : readonly CreateEvent_<DrawRequest >[]
  gameResults : readonly CreateEvent_<GameResult>[]
}

export default function Contracts({gameProposals, activeGames, passiveGames, drawRequests, gameResults} : ContractsProp<any, any>) {

  const classes = useStyles();

  return (
    <>
      <Grid container spacing={4}>
      <Grid item xs={12}>
        <Table size="small">
          <TableHead>
            <TableRow className={classes.tableRow}>
              <TableCell className={classes.tableCell}>Game</TableCell>
              <TableCell className={classes.tableCell}>Side</TableCell>
              <TableCell className={classes.tableCell}>Opponent</TableCell>
              <TableCell className={classes.tableCell}>State</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            { gameProposals.map(c => <GameProposalRow createGp={c} key={"0" + c.contractId}/>) }
            { activeGames.map(c => <ActiveSideOfGameRow createAs={c} key={"1" + c.contractId}/>) }
            { passiveGames.map(c => <PassiveSideOfGameRow createPs={c} key={"2" + c.contractId}/>) }
            { drawRequests.map(c => <DrawRequestRow createDr={c} key={"3" + c.contractId}/>)}
            { gameResults.map(c => <GameResultRow createGr={c} key={"4" + c.contractId}/>)}
          </TableBody>
        </Table>
      </Grid>
      </Grid>
    </>
  );
}