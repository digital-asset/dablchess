import React, { useState } from 'react';
import { useStreamQuery } from '@daml/react';
import { ActiveSideOfGame, PassiveSideOfGame, Move } from '@daml-ts/chess-0.5.0/lib/Chess';
import { CircularProgress } from '@material-ui/core';
import Chessboard, { Piece as CPiece, Position } from 'chessboardjsx';
import { Button, ButtonGroup, Box, IconButton, Dialog, DialogTitle, Typography } from '@material-ui/core';
import { ContractId } from '@daml/types';
import { useLedger } from '@daml/react';
import { Coord, Piece, PieceType, Side, SplitGameState } from '@daml-ts/chess-0.5.0/lib/Types';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { ArrowBack } from '@material-ui/icons';
import { useHistory } from 'react-router-dom';

type backgroundColorStyle = {
  backgroundColor: string;
};

type moveArgs = {
  sourceSquare: string;
  targetSquare: string;
  piece: CPiece;
};

function convertPiece(piece: Piece): CPiece {
  const wb = piece.owner === Side.White ? 'w' : 'b';
  const t = piece.tp === PieceType.Knight ? 'N' : piece.tp[0];
  return (wb + t) as CPiece;
}

function toCoordAndDarkPiece(intCoord: string): [string, boolean] {
  let asInt = parseInt(intCoord, 10);
  let col = Math.floor(asInt / 8);
  let row = asInt % 8;
  let coord = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'][col] + (row + 1);
  let darkPiece = col % 2 === 0 ? asInt % 2 === 0 : asInt % 2 !== 0;
  return [coord, darkPiece];
}

type PromotePieceTypeDialogProp = {
  open: boolean;
  setPromotion: any; //(arg0:any) => void
};

function PromotePieceTypeDialog({ open, setPromotion }: PromotePieceTypeDialogProp) {
  return (
    <Dialog aria-labelledby="simple-dialog-title" open={open} maxWidth="md" fullWidth={true}>
      <DialogTitle id="simple-dialog-title">Promote pawn to?</DialogTitle>
      <ButtonGroup>
        <Button onClick={() => setPromotion(PieceType.Queen)}>Queen</Button>
        <Button onClick={() => setPromotion(PieceType.Bishop)}>Bishop</Button>
        <Button onClick={() => setPromotion(PieceType.Knight)}>Knight</Button>
        <Button onClick={() => setPromotion(PieceType.Rook)}>Rook</Button>
      </ButtonGroup>
    </Dialog>
  );
}

const visibleDarkStyle: backgroundColorStyle = { backgroundColor: 'rgb(135, 102, 74)' };
const visibleLightStyle: backgroundColorStyle = { backgroundColor: 'rgb(210, 189, 158)' };

const BackButton = () => {
  return (
    <Button component={Link} to="/">
      <ArrowBack /> &nbsp; Back to Game Table
    </Button>
  );
};
export default function Game() {
  const { contractId } = useParams<{ contractId: string }>();

  const { loading: loadingActiveGames, contracts: activeGames } = useStreamQuery(ActiveSideOfGame);
  const { loading: loadingPassiveGames, contracts: passiveGames } = useStreamQuery(PassiveSideOfGame);

  const activeContract = activeGames.find((c) => c.contractId === decodeURIComponent(contractId));
  const passiveContract = passiveGames.find((c) => c.contractId === decodeURIComponent(contractId));

  if (loadingActiveGames || loadingPassiveGames) {
    return <CircularProgress />;
  }

  if (passiveContract) {
    return (
      <div className="game">
        <BackButton />
        <PassiveGame contract={passiveContract.payload} contractId={passiveContract.contractId} />;
      </div>
    );
  } else if (activeContract) {
    return (
      <div className="game">
        <BackButton />
        <ActiveGame contract={activeContract.payload} contractId={activeContract.contractId} />
      </div>
    );
  }

  return (
    <div className="game">
      <BackButton />
      <div>Could not find board...</div>
    </div>
  );
}

const ActiveGame = (props: { contract: ActiveSideOfGame; contractId: ContractId<ActiveSideOfGame> }) => {
  const ledger = useLedger();
  const history = useHistory();

  const { contract, contractId } = props;

  const { side, active: game } = contract;

  const [promote, setPromote] = useState<PieceType | null>(null);
  const [openPromoteDialog, setOpenPromoteDialog] = useState(false);

  function setPromotion(pt: PieceType): void {
    setPromote(pt);
    setOpenPromoteDialog(false);
  }

  let squareStyles: Record<string, backgroundColorStyle> = {};
  let position: Position = {};
  let board = game.pieces.textMap;

  for (let k in board) {
    let [coord, darkPiece] = toCoordAndDarkPiece(k);
    let piece = board[k];
    squareStyles[coord] = darkPiece ? visibleDarkStyle : visibleLightStyle;
    if (piece !== null) {
      position[coord] = convertPiece(piece);
    }
  }

  async function exerciseMove(contractId: ContractId<ActiveSideOfGame>, move: Move) {
    const [choiceReturnValue, events] = await ledger.exercise(ActiveSideOfGame.Move, contractId, move);
    console.log(`After moving ${JSON.stringify(choiceReturnValue)} ${JSON.stringify(events)}`);
    history.push(`/`);
  }

  const onDrop = ({ sourceSquare, targetSquare, piece }: moveArgs) => {
    delete position[sourceSquare];
    position[targetSquare] = piece;
    const from = Coord.decoder.runWithException(sourceSquare.toUpperCase());
    const to = Coord.decoder.runWithException(targetSquare.toUpperCase());
    const lastRow = parseInt(targetSquare[1], 10);
    if (
      (piece === 'wP' && lastRow === 8 && game.side === Side.White) ||
      (piece === 'bP' && lastRow === 1 && game.side === Side.Black)
    ) {
      console.log('Time to promote!');
      setOpenPromoteDialog(true);
    }
    const move: Move = { from, to, promote };
    exerciseMove(contractId, move);
  };

  const title = game.inCheck_ ? 'In check!' : 'Make your move.';

  return (
    <div className="game-content">
      <div>
        <Typography variant="h1">{title}</Typography>
        <p>{!game.inCheck_ && 'Drag and drop a piece into position.'}</p>
      </div>
      <GameBoard
        side={side}
        allowDrag={true}
        onDrop={onDrop}
        position={position}
        setPromotion={setPromotion}
        openPromoteDialog={openPromoteDialog}
        squareStyles={squareStyles}
      />
    </div>
  );
};

const PassiveGame = (props: { contract: PassiveSideOfGame; contractId: ContractId<PassiveSideOfGame> }) => {
  const { contract } = props;
  const { side, passive: game } = contract;

  let squareStyles: Record<string, backgroundColorStyle> = {};
  let position: Position = {};
  let board = game.pieces.textMap;

  for (let k in board) {
    let [coord, darkPiece] = toCoordAndDarkPiece(k);
    let piece = board[k];
    squareStyles[coord] = darkPiece ? visibleDarkStyle : visibleLightStyle;
    if (piece !== null) {
      position[coord] = convertPiece(piece);
    }
  }

  const title = game.inCheck_ ? 'Check!' : 'Waiting for your turn...';

  return (
    <div className="game-content">
      <div>
        <Typography variant="h2">{title}</Typography>
        <p>{!game.inCheck_ && 'Drag and drop a piece into position.'}</p>
      </div>
      <GameBoard side={side} allowDrag={false} onDrop={(e) => {}} position={position} squareStyles={squareStyles} />
    </div>
  );
};

const GameBoard = (props: {
  side: Side;
  setPromotion?: (pt: PieceType) => void;
  openPromoteDialog?: boolean;
  allowDrag: boolean;
  onDrop: ({ sourceSquare, targetSquare, piece }: { sourceSquare: any; targetSquare: any; piece: any }) => void;
  position: Position;
  squareStyles: Record<string, backgroundColorStyle>;
}) => {
  const { side, setPromotion, openPromoteDialog, allowDrag, onDrop, position, squareStyles } = props;

  return (
    <div className="game-board">
      <PromotePieceTypeDialog open={!!openPromoteDialog} setPromotion={setPromotion} />
      <Chessboard
        allowDrag={() => allowDrag}
        boardStyle={{ margin: 'auto' }}
        onDrop={onDrop}
        orientation={side.toLowerCase() as 'white' | 'black'}
        position={position}
        squareStyles={squareStyles}
      />
    </div>
  );
};
