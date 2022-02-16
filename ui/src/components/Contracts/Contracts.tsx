import React from 'react';
import { CreateEvent } from '@daml/ledger';
import { useLedger } from '@daml/react';
import {
  Button,
  ButtonGroup,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
} from '@material-ui/core';
import {
  ActiveSideOfGame,
  DrawRequest,
  Game,
  GameProposal,
  PassiveSideOfGame,
  GameResult,
} from '@daml-ts/chess-0.5.0/lib/Chess';
import { Side } from '@daml-ts/chess-0.5.0/lib/Types';
import { useUserState } from '../../context/UserContext';
import { useAliasMaps } from '../../context/AliasMapContext';
import NewGameDialog from '../NewGameDialog';
import { useHistory } from 'react-router-dom';

type NewGameButtonProp = {
  text: string;
  onClick: () => void;
};

type MyButtonProp = {
  text: any;
  onClick: () => void;
};

function MyButton({ text, onClick }: MyButtonProp) {
  return (
    <Button color="primary" size="small" className="px-2" variant="contained" onClick={onClick}>
      {text}
    </Button>
  );
}

function opponent(g: Game, party: string): string {
  return g.proposer === party ? g.opponent : g.proposer;
}

function otherSide(s: Side): Side {
  return s === Side.White ? Side.Black : Side.White;
}

function side(g: Game | GameResult, party: string): string {
  return g.proposer === party ? g.desiredSide : otherSide(g.desiredSide);
}

const GameIdCell = (props: { id: string }) => {
  return (
    <TableCell className="tableCell">
      <p>{props.id}</p>
    </TableCell>
  );
};

const SideCell = (props: { side: string }) => {
  return (
    <TableCell className="tableCell">
      <p className={props.side.toLocaleLowerCase()}>{props.side}</p>
    </TableCell>
  );
};

const OpponentCell = (props: { opponent: string }) => {
  return (
    <TableCell className="tableCell">
      <p>{props.opponent}</p>
    </TableCell>
  );
};

const StatusCell = (props: { status?: string }) => {
  return <TableCell className="tableCell">{props.status && <p>{props.status}</p>}</TableCell>;
};

type CreateEvent_<T extends object> = CreateEvent<T, any, any>;

type GameProposalRowProp = {
  createGp: CreateEvent_<GameProposal>;
};

function GameProposalRow({ createGp }: GameProposalRowProp) {
  console.log(`Converting a gameProposal ${createGp.contractId}.`);
  let gp = createGp.payload;

  const ledger = useLedger();
  const aliasMap = useAliasMaps();
  const userState = useUserState();
  if (!userState.isAuthenticated) {
    return null;
  }
  async function acceptGameProposal() {
    console.log('Accepting game proposal:' + createGp.contractId);
    const [choiceReturnValue, events] = await ledger.exercise(GameProposal.Accept, createGp.contractId, {});
    console.log(`After accepting game proposal ${JSON.stringify(choiceReturnValue)} ${JSON.stringify(events)}`);
  }

  return (
    <TableRow className="tableRow">
      <GameIdCell id={gp.gameId} />
      <SideCell side={gp.desiredSide} />
      <OpponentCell opponent={aliasMap.toAlias(userState.party === gp.opponent ? gp.proposer : gp.opponent)} />
      <StatusCell
        status={
          userState.party !== gp.opponent
            ? `Waiting for ${aliasMap.toAlias(gp.opponent)} to accept game request...`
            : `${aliasMap.toAlias(gp.opponent)} sent you a request to play chess!`
        }
      />
      <TableCell className="tableCell" align="right">
        {userState.party === gp.opponent && <MyButton text="Accept" onClick={acceptGameProposal} />}
      </TableCell>
    </TableRow>
  );
}

type ActiveSideofGameRowProp = {
  createAs: CreateEvent_<ActiveSideOfGame>;
};

function ActiveSideOfGameRow({ createAs }: ActiveSideofGameRowProp) {
  console.log(`Converting an active side of game ${createAs.contractId}.`);
  let ap = createAs.payload;
  const history = useHistory();
  const ledger = useLedger();
  const aliasMap = useAliasMaps();

  function move() {
    history.push(`/app/game/${encodeURIComponent(createAs.contractId)}`);
  }

  async function claimDraw() {
    console.log('claiming a draw ' + createAs.contractId);
    const [choiceReturnValue, events] = await ledger.exercise(ActiveSideOfGame.DrawClaim, createAs.contractId, {});
    console.log(`After claiming draw ${JSON.stringify(choiceReturnValue)} ${JSON.stringify(events)}`);
  }

  async function requestDraw() {
    console.log('requesting a draw, active' + createAs.contractId);
    const [choiceReturnValue, events] = await ledger.exercise(
      ActiveSideOfGame.ActiveDrawProposal,
      createAs.contractId,
      {}
    );
    console.log(`After requesting draw ${JSON.stringify(choiceReturnValue)} ${JSON.stringify(events)}`);
  }

  async function surrender() {
    console.log('surrendering, active' + createAs.contractId);
    const [choiceReturnValue, events] = await ledger.exercise(
      ActiveSideOfGame.ActiveSurrender,
      createAs.contractId,
      {}
    );
    console.log(`After surrendering ${JSON.stringify(choiceReturnValue)} ${JSON.stringify(events)}`);
  }

  return (
    <>
      <TableRow className="tableRow">
        <GameIdCell id={ap.game.gameId} />
        <SideCell side={ap.side} />
        <OpponentCell opponent={aliasMap.toAlias(opponent(ap.game, ap.player))} />
        <StatusCell />
        <TableCell className="tableCell" align="right">
          <ButtonGroup>
            <MyButton text="Move" onClick={move} />
            <MyButton text="Claim Draw" onClick={claimDraw} />
            <MyButton text="Request Draw" onClick={requestDraw} />
            <MyButton text="Surrender" onClick={surrender} />
          </ButtonGroup>
        </TableCell>
      </TableRow>
    </>
  );
}

type PassiveSideOfGameRowProp = {
  createPs: CreateEvent_<PassiveSideOfGame>;
};

function PassiveSideOfGameRow({ createPs }: PassiveSideOfGameRowProp) {
  console.log(`Converting an passive side of game ${createPs.contractId}.`);
  let pp = createPs.payload;

  const ledger = useLedger();
  const aliasMap = useAliasMaps();
  const history = useHistory();

  async function requestDraw() {
    console.log('requesting a draw, passive' + createPs.contractId);
    const [choiceReturnValue, events] = await ledger.exercise(
      PassiveSideOfGame.PassiveDrawProposal,
      createPs.contractId,
      {}
    );
    console.log(`After asking for a draw ${JSON.stringify(choiceReturnValue)} ${JSON.stringify(events)}`);
  }

  async function surrender() {
    console.log('surrendering, passive' + createPs.contractId);
    const [choiceReturnValue, events] = await ledger.exercise(
      PassiveSideOfGame.PassiveSurrender,
      createPs.contractId,
      {}
    );
    console.log(`After surrendering ${JSON.stringify(choiceReturnValue)} ${JSON.stringify(events)}`);
  }

  function onClick() {
    history.push(`/app/game/${encodeURIComponent(createPs.contractId)}`);
  }

  const opponent_ = opponent(pp.game, pp.player); // Ideally this should be userState.party, but we'll save a React state.
  return (
    <>
      <TableRow className="tableRow">
        <GameIdCell id={pp.game.gameId} />
        <SideCell side={side(pp.game, pp.player)} />
        <OpponentCell opponent={aliasMap.toAlias(opponent_)} />
        <StatusCell status={`Waiting for ${aliasMap.toAlias(opponent_)}'s move...`} />
        <TableCell className="tableCell" align="right">
          <ButtonGroup>
            <MyButton text="View Board" onClick={onClick} />
            <MyButton text="Request Draw" onClick={requestDraw} />
            <MyButton text="Surrender" onClick={surrender} />
          </ButtonGroup>
        </TableCell>
      </TableRow>
    </>
  );
}

type DrawRequestRowProp = {
  createDr: CreateEvent_<DrawRequest>;
};

function DrawRequestRow({ createDr }: DrawRequestRowProp) {
  console.log(`Converting an draw request ${createDr.contractId}.`);
  let dp = createDr.payload;

  const ledger = useLedger();
  const aliasMap = useAliasMaps();
  const userState = useUserState();
  if (!userState.isAuthenticated) {
    return null;
  }

  async function accept() {
    console.log('accepting draw ' + createDr.contractId);
    const [choiceReturnValue, events] = await ledger.exercise(DrawRequest.AcceptDrawRequest, createDr.contractId, {});
    console.log(`After accepting draw ${JSON.stringify(choiceReturnValue)} ${JSON.stringify(events)}`);
  }

  const opponent_ = opponent(dp.game, userState.party);
  return (
    <>
      <TableRow className="tableRow">
        <GameIdCell id={dp.game.gameId} />
        <SideCell side={side(dp.game, userState.party)} />
        <OpponentCell opponent={aliasMap.toAlias(opponent_)} />
        <StatusCell
          status={
            userState.party === dp.player ? 'You requested a draw' : `${aliasMap.toAlias(dp.player)} requested a draw.`
          }
        />
        <TableCell className="tableCell" align="right">
          {userState.party !== dp.player && (
            <ButtonGroup>
              <MyButton text="Accept" onClick={accept} />
            </ButtonGroup>
          )}
        </TableCell>
      </TableRow>
    </>
  );
}

type GameResultRowProp = {
  createGr: CreateEvent_<GameResult>;
};

function GameResultRow({ createGr }: GameResultRowProp) {
  console.log(`Converting a gameResult ${createGr.contractId}.`);

  const userState = useUserState();
  const aliasMap = useAliasMaps();
  if (!userState.isAuthenticated) {
    return null;
  }

  let gp = createGr.payload;
  let gameState = 'No winner!';

  switch (gp.drawOrWinner.tag) {
    case 'Winner':
      gameState = gp.drawOrWinner.value + ' won!';
      break;
    case 'Draw':
      switch (gp.drawOrWinner.value.tag) {
        case 'PlayerDraw':
          let drawRequester = gp.drawOrWinner.value.value;
          if (drawRequester === userState.party) {
            gameState = 'Your draw was accepted.';
          } else {
            gameState = `You accepted ${drawRequester}'s draw offer`;
          }
          break;
        case 'Stalemate':
          gameState = 'Stalemate';
          break;
        case 'ThreefoldRepetition':
          gameState = 'Draw, three fold repition.';
          break;
        case 'FiftyMoveRule':
          gameState = 'Draw, fifty non capturing nor pawn.';
          break;
      }
      break;
  }

  return (
    <TableRow className="tableRow">
      <GameIdCell id={gp.gameId} />
      <SideCell side={side(gp, userState.party)} />
      <OpponentCell
        opponent={gp.opponent === userState.party ? aliasMap.toAlias(gp.proposer) : aliasMap.toAlias(gp.opponent)}
      />
      <StatusCell status={gameState} />
      <TableCell className="tableCell"></TableCell>
    </TableRow>
  );
}

type ContractsProp<K, I> = {
  gameProposals: readonly CreateEvent_<GameProposal>[];
  activeGames: readonly CreateEvent_<ActiveSideOfGame>[];
  passiveGames: readonly CreateEvent_<PassiveSideOfGame>[];
  drawRequests: readonly CreateEvent_<DrawRequest>[];
  gameResults: readonly CreateEvent_<GameResult>[];
};

export default function Contracts({
  gameProposals,
  activeGames,
  passiveGames,
  drawRequests,
  gameResults,
}: ContractsProp<any, any>) {
  const tableIsEmpty =
    gameProposals.length === 0 &&
    activeGames.length === 0 &&
    passiveGames.length === 0 &&
    drawRequests.length === 0 &&
    gameResults.length === 0;

  const [newGameDialogOpen, setOpenNewGameDialog] = React.useState<boolean>(tableIsEmpty);

  return (
    <div className="contracts">
      <div className="table-actions">
        <Typography variant="h2">Game Table</Typography>
        <NewGameButton text="New Game" onClick={() => setOpenNewGameDialog(true)} />
      </div>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Table size="small">
            <TableHead>
              <TableRow className="tableRow">
                <TableCell className="tableCell">
                  <p>Game</p>
                </TableCell>
                <TableCell className="tableCell">
                  <p>Side</p>
                </TableCell>
                <TableCell className="tableCell">
                  <p>Opponent</p>
                </TableCell>
                <TableCell className="tableCell">
                  <p>Status</p>
                </TableCell>
                <TableCell className="tableCell"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {gameProposals.map((c) => (
                <GameProposalRow createGp={c} key={'0' + c.contractId} />
              ))}
              {activeGames.map((c) => (
                <ActiveSideOfGameRow createAs={c} key={'1' + c.contractId} />
              ))}
              {passiveGames.map((c) => (
                <PassiveSideOfGameRow createPs={c} key={'2' + c.contractId} />
              ))}
              {drawRequests.map((c) => (
                <DrawRequestRow createDr={c} key={'3' + c.contractId} />
              ))}
              {gameResults.map((c) => (
                <GameResultRow createGr={c} key={'4' + c.contractId} />
              ))}
            </TableBody>
          </Table>
        </Grid>
      </Grid>
      <NewGameDialog open={newGameDialogOpen} handleClose={() => setOpenNewGameDialog(false)} />
    </div>
  );
}

function NewGameButton({ text, onClick }: NewGameButtonProp) {
  return (
    <Button className="new-game" variant="contained" onClick={onClick}>
      {text}
    </Button>
  );
}
