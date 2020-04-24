import React from "react";
import { useLedger } from "@daml/react";
import { Button, ButtonGroup, Grid, Table, TableHead, TableRow, TableCell , TableBody } from "@material-ui/core";
import { useStyles } from "./styles";
import { ActiveSideOfGame, GameProposal, PassiveSideOfGame } from "@daml-ts/chess-0.2.0/lib/Chess";
import { useAliases, useUserState } from "../../context/UserContext";
import ChessBoardDialog from "./components/ChessBoardDialog/ChessBoardDialog";

function MyButton({text, onClick}){
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

function GameProposalRow({gameProposal}) {
  console.log(`Converting a gameProposal ${gameProposal.contractId}.`);
  let gp = gameProposal.payload;

  const userState = useUserState();
  const classes = useStyles();
  const ledger = useLedger();
  const [toAlias] = useAliases(e => {return});

  async function acceptGameProposal(){
    console.log("Accepting game proposal:" + gameProposal.contractId);
    const [choiceReturnValue, events] = await ledger.exercise(GameProposal.Accept, gameProposal.contractId, {});
    console.log(`After accepting game proposal ${JSON.stringify(choiceReturnValue)} ${JSON.stringify(events)}`);
  }

  return (
      <TableRow className={classes.tableRow}>
        <TableCell className={classes.tableCell}>{gp.gameId}</TableCell>
        <TableCell className={classes.tableCell}>{gp.desiredSide}</TableCell>
        <TableCell className={classes.tableCell}>{toAlias( userState.party === gp.opponent ? gp.proposer : gp.opponent)}</TableCell>
        { userState.party === gp.opponent
        ? (<TableCell className={classes.tablecell}>
            <MyButton text="Accept" onClick={acceptGameProposal} />
          </TableCell>)
        : (<TableCell className={classes.tablecell}>{toAlias(gp.opponent)} has to accept.</TableCell>)
        }
      </TableRow>
  );
}

function ActiveSideOfGameRow({activeSideOfGame}) {
  console.log(`Converting an active side of game ${activeSideOfGame.contractId}.`);
  let ap = activeSideOfGame.payload;

  const classes = useStyles();
  const ledger = useLedger();
  const [toAlias] = useAliases(e => {return});
  const [openChessBoard, setOpenChessBoard] = React.useState(false);

  function handleClose() {
    setOpenChessBoard(false);
  };

  function move(){
    setOpenChessBoard(true);
  }

  async function claimDraw(){
    console.log("claiming a draw " + activeSideOfGame.contractId);
    const [choiceReturnValue, events] = await ledger.exercise(ActiveSideOfGame.ClaimDraw, activeSideOfGame.contractId, {});
    console.log(`After claiming draw ${JSON.stringify(choiceReturnValue)} ${JSON.stringify(events)}`);

  }
  async function forfeit(){
    console.log("forfeiting " + activeSideOfGame.contractId);
    const [choiceReturnValue, events] = await ledger.exercise(ActiveSideOfGame.Forfeit, activeSideOfGame.contractId, {});
    console.log(`After forfeiting ${JSON.stringify(choiceReturnValue)} ${JSON.stringify(events)}`);
  }

  return (
    <>
      <ChessBoardDialog open={openChessBoard} onClose={handleClose} game={ap.active} active={true} contractId={activeSideOfGame.contractId} />
      <TableRow className={classes.tableRow}>
        <TableCell className={classes.tableCell}>{ap.gameId}</TableCell>
        <TableCell className={classes.tableCell}>{ap.side}</TableCell>
        <TableCell className={classes.tableCell}>{toAlias(ap.opponent)}</TableCell>
        <TableCell className={classes.tablecell}>
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

function PassiveSideOfGameRow({passiveSideOfGame}) {
  console.log(`Converting an passive side of game ${passiveSideOfGame.contractId}.`);
  let pp = passiveSideOfGame.payload;

  const classes = useStyles();
  const ledger = useLedger();
  const [toAlias] = useAliases(e => {return});

  async function askForADraw(){
    console.log("asking for a draw " + passiveSideOfGame.contractId);
    const [choiceReturnValue, events] = await ledger.exercise(PassiveSideOfGame.AskForADraw, passiveSideOfGame.contractId, {});
    console.log(`After asking for a draw ${JSON.stringify(choiceReturnValue)} ${JSON.stringify(events)}`);
  }

  async function resign(){
    console.log("resigning " + passiveSideOfGame.contractId);
    const [choiceReturnValue, events] = await ledger.exercise(PassiveSideOfGame.Resign, passiveSideOfGame.contractId, {});
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
      <ChessBoardDialog open={openChessBoard} onClose={handleClose} game={pp.passive} active={false} contractId={passiveSideOfGame.contractId} />
      <TableRow className={classes.tableRow} onClick={onClick}>
        <TableCell className={classes.tableCell}>{pp.gameId}</TableCell>
        <TableCell className={classes.tableCell}>{pp.side}</TableCell>
        <TableCell className={classes.tableCell}>{pp.opponent}</TableCell>
        <TableCell className={classes.tablecell}>
          Waiting for {toAlias(pp.opponent)}'s move.
          <ButtonGroup>
            <MyButton text="Ask for a draw" onClick={askForADraw} />
            <MyButton text="Resign" onClick={resign} />
          </ButtonGroup>
        </TableCell>
      </TableRow>
    </>
  );
}

function GameResultRow({gameResult}) {
  console.log(`Converting a gameResult ${gameResult.contractId}.`);

  const classes = useStyles();
  const userState = useUserState();
  const [toAlias] = useAliases(e => {return});
  let gp = gameResult.payload;
  let gameState="No winner!";
  switch(gp.drawOrWinner.tag){
    case "Winner":
      gameState = gp.drawOrWinner.value + " won!";
      break;
    default:
      console.log("Not implemented gameState : " + JSON.stringify(gp.drawOrWinner));
      break
  };
  return (
      <TableRow className={classes.tableRow}>
        <TableCell className={classes.tableCell}>{gp.gameId}</TableCell>
        <TableCell className={classes.tableCell}></TableCell>
        <TableCell className={classes.tableCell}>{gp.opponent === userState.party ? toAlias(gp.proposer) : toAlias(gp.opponent)}</TableCell>
        <TableCell className={classes.tablecell}>{gameState}</TableCell>
      </TableRow>
  );
}


export default function Contracts({ gameProposals, activeGames, passiveGames, gameResults  }) {

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
            { gameProposals.map(c => <GameProposalRow gameProposal={c} key={"0" + c.contractId}/>) }
            { activeGames.map(c => <ActiveSideOfGameRow activeSideOfGame={c} key={"1" + c.contractId}/>) }
            { passiveGames.map(c => <PassiveSideOfGameRow passiveSideOfGame={c} key={"2" + c.contractId}/>) }
            { gameResults.map(c => <GameResultRow gameResult={c} key={"3" + c.contractId}/>)}
          </TableBody>
        </Table>
      </Grid>
      </Grid>
    </>
  );
}