import React from "react";
import { CreateEvent } from "@daml/ledger";
import { useLedger } from "@daml/react";
import { Button, ButtonGroup, Grid, Table, TableHead, TableRow, TableCell , TableBody } from "@material-ui/core";
import { useStyles } from "./styles";
import { ActiveSideOfGame, DrawRequest, Game, GameProposal, PassiveSideOfGame, GameResult } from "@daml-ts/chess-0.5.0/lib/Chess";
import { Side } from "@daml-ts/chess-0.5.0/lib/Types";
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

function opponent(g : Game, party : string) : string {
  return g.proposer === party? g.opponent : g.proposer
}

function otherSide( s : Side) : Side {
  return s === Side.White ? Side.Black : Side.White;
}

function side(g : Game | GameResult, party : string) : string {
  return g.proposer === party? g.desiredSide : otherSide(g.desiredSide);
}

type CreateEvent_<T extends object> = CreateEvent<T, any, any>
type GameProposalRowProp = {
  createGp : CreateEvent_<GameProposal>
}

function GameProposalRow({createGp} : GameProposalRowProp ) {
  console.log(`Converting a gameProposal ${createGp.contractId}.`);
  let gp = createGp.payload;

  const classes = useStyles();
  const ledger = useLedger();
  const aliasMap = useAliasMaps();
  const userState = useUserState();
  if(!userState.isAuthenticated){
    return null;
  }
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
    const [choiceReturnValue, events] = await ledger.exercise(ActiveSideOfGame.DrawClaim, createAs.contractId, {});
    console.log(`After claiming draw ${JSON.stringify(choiceReturnValue)} ${JSON.stringify(events)}`);
  }

  async function requestDraw(){
    console.log("requesting a draw, active" + createAs.contractId);
    const [choiceReturnValue, events] = await ledger.exercise(ActiveSideOfGame.ActiveDrawProposal, createAs.contractId, {});
    console.log(`After requesting draw ${JSON.stringify(choiceReturnValue)} ${JSON.stringify(events)}`);
  }

  async function surrender(){
    console.log("surrendering, active" + createAs.contractId);
    const [choiceReturnValue, events] = await ledger.exercise(ActiveSideOfGame.ActiveSurrender, createAs.contractId, {});
    console.log(`After surrendering ${JSON.stringify(choiceReturnValue)} ${JSON.stringify(events)}`);
  }

  return (
    <>
      <ChessBoardDialog open={openChessBoard} side={ap.side} onClose={handleClose} game={ap.active} c={{kind:"active", contractId:createAs.contractId}} />
      <TableRow className={classes.tableRow}>
        <TableCell className={classes.tableCell}>{ap.game.gameId}</TableCell>
        <TableCell className={classes.tableCell}>{ap.side}</TableCell>
        <TableCell className={classes.tableCell}>{aliasMap.toAlias(opponent(ap.game, ap.player))}</TableCell>
        <TableCell className={classes.tableCell}>
          <ButtonGroup>
            <MyButton text="Move" onClick={move}/>
            <MyButton text="Claim Draw" onClick={claimDraw}/>
            <MyButton text="Request Draw" onClick={requestDraw}/>
            <MyButton text="Surrender" onClick={surrender}/>
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

  async function requestDraw(){
    console.log("requesting a draw, passive" + createPs.contractId);
    const [choiceReturnValue, events] = await ledger.exercise(PassiveSideOfGame.PassiveDrawProposal, createPs.contractId, {});
    console.log(`After asking for a draw ${JSON.stringify(choiceReturnValue)} ${JSON.stringify(events)}`);
  }

  async function surrender(){
    console.log("surrendering, passive" + createPs.contractId);
    const [choiceReturnValue, events] = await ledger.exercise(PassiveSideOfGame.PassiveSurrender, createPs.contractId, {});
    console.log(`After surrendering ${JSON.stringify(choiceReturnValue)} ${JSON.stringify(events)}`);
  }

  const [openChessBoard, setOpenChessBoard] = React.useState(false);

  function handleClose() {
    setOpenChessBoard(false);
  };

  function onClick(){
    setOpenChessBoard(true);
  }

  const opponent_ = opponent(pp.game, pp.player); // Ideally this should be userState.party, but we'll save a React state.
  return (
    <>
      <ChessBoardDialog open={openChessBoard} side={pp.side} onClose={handleClose} game={pp.passive} c={{kind:"passive", contractId:createPs.contractId}} />
      <TableRow className={classes.tableRow} onClick={onClick}>
        <TableCell className={classes.tableCell}>{pp.game.gameId}</TableCell>
        <TableCell className={classes.tableCell}>{side(pp.game, pp.player)}</TableCell>
        <TableCell className={classes.tableCell}>{aliasMap.toAlias(opponent_)}</TableCell>
        <TableCell className={classes.tableCell}>
          Waiting for {aliasMap.toAlias(opponent_)}'s move.
          <ButtonGroup>
            <MyButton text="Request Draw" onClick={requestDraw} />
            <MyButton text="Surrender" onClick={surrender} />
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
  const aliasMap = useAliasMaps();
  const userState = useUserState();
  if(!userState.isAuthenticated){
    return null;
  }

  async function accept(){
    console.log("accepting draw " + createDr.contractId);
    const [choiceReturnValue, events] = await ledger.exercise(DrawRequest.AcceptDrawRequest, createDr.contractId, {});
    console.log(`After accepting draw ${JSON.stringify(choiceReturnValue)} ${JSON.stringify(events)}`);
  }

  const opponent_ = opponent(dp.game, userState.party);
  return (
    <>
      <TableRow className={classes.tableRow}>
        <TableCell className={classes.tableCell}>{dp.game.gameId}</TableCell>
        <TableCell className={classes.tableCell}>{side(dp.game, userState.party)}</TableCell>
        <TableCell className={classes.tableCell}>{aliasMap.toAlias(opponent_)}</TableCell>
        { userState.party === dp.player       // Who made this draw request
        ? (<TableCell className={classes.tableCell}>You requested a draw.</TableCell>)
        : (<TableCell className={classes.tableCell}>
            {aliasMap.toAlias(dp.player)} requested a draw:
            <ButtonGroup>
              <MyButton text="Accept" onClick={accept} />
            </ButtonGroup>
          </TableCell>)
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
  if(!userState.isAuthenticated){
    return null;
  }

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
        <TableCell className={classes.tableCell}>{side(gp, userState.party)}</TableCell>
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
