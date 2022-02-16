import React, { useState } from 'react';
import { useStreamQuery } from '@daml/react';
import { ActiveSideOfGame, PassiveSideOfGame, Move } from '@daml-ts/chess-0.5.0/lib/Chess';
import { CircularProgress } from '@material-ui/core';
import Chessboard, { Piece as CPiece, Position } from 'chessboardjsx';
import { Button, Tooltip, Select, Typography, MenuItem } from '@material-ui/core';
import { ContractId } from '@daml/types';
import { useLedger } from '@daml/react';
import { Coord, Piece, PieceType, Side } from '@daml-ts/chess-0.5.0/lib/Types';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { ArrowBack, Info } from '@material-ui/icons';
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

type PromotePieceTypeProp = {
  setPromotion: any; //(arg0:any) => void
};

function PromotePieceType({ setPromotion }: PromotePieceTypeProp) {
  return (
    <Select onChange={(e) => setPromotion(e.target.value)} placeholder="Promotion">
      <MenuItem value={'Queen'}>Queen</MenuItem>
      <MenuItem value={'Bishop'}>Bishop</MenuItem>
      <MenuItem value={'Knight'}>Knight</MenuItem>
      <MenuItem value={'Rook'}>Rook</MenuItem>
    </Select>
  );
}

const visibleDarkStyle: backgroundColorStyle = { backgroundColor: 'rgb(135, 102, 74)' };
const visibleLightStyle: backgroundColorStyle = { backgroundColor: 'rgb(210, 189, 158)' };

const BackButton = () => {
  return (
    <Button className="back-button" component={Link} to="/">
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
    return (
      <div className="game loading">
        <CircularProgress color="inherit" />
      </div>
    );
  }

  let body = <div>Could not find board...</div>;
  let title = '';
  if (passiveContract) {
    title = passiveContract.payload.passive.inCheck_ ? 'Check!' : 'Waiting for your turn...';
    body = <PassiveGame contract={passiveContract.payload} contractId={passiveContract.contractId} />;
  } else if (activeContract) {
    title = activeContract.payload.active.inCheck_ ? 'In check!' : 'Make your move.';
    body = <ActiveGame contract={activeContract.payload} contractId={activeContract.contractId} />;
  }

  return (
    <div className="game">
      <BackButton />
      <p>{title}</p>
      {body}
    </div>
  );
}

const ActiveGame = (props: { contract: ActiveSideOfGame; contractId: ContractId<ActiveSideOfGame> }) => {
  const ledger = useLedger();
  const history = useHistory();

  const { contract, contractId } = props;

  const { side, active: game } = contract;

  const [promote, setPromote] = useState<PieceType | null>(null);
  const [showPromoteDialog, setShowPromoteDialog] = useState(false);
  const [move, setMove] = useState<{ from: any; to: any }>();

  function setPromotion(pt: PieceType): void {
    setPromote(pt);
    setShowPromoteDialog(false);
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
      setShowPromoteDialog(true);
    } else {
      setShowPromoteDialog(false);
    }
    const move = { from, to };
    setMove(move);
  };

  return (
    <div className="game-content">
      <div className="chess-board-wrapper">
        <p>{!game.inCheck_ && 'Drag and drop a piece into position.'}</p>
        <GameBoard side={side} allowDrag={true} onDrop={onDrop} position={position} squareStyles={squareStyles} />
      </div>
      <div className="move-wrapper">
        <p className="move">Move</p>
        <p>From: {move?.from}</p>
        <p>To: {move?.to}</p>
        <div>
          <div className="promote">
            <Tooltip title="Pawn promotion occurs when a pawn reaches the farthest rank from its original square—the eighth rank for White and first rank for Black. When this happens, the player can replace the pawn for a queen, a rook, a bishop, or a knight. ">
              <Info />
            </Tooltip>
            &nbsp;<p>Promote: </p>
            {showPromoteDialog ? <PromotePieceType setPromotion={setPromotion} /> : promote} &nbsp;
          </div>
        </div>
        <Button disabled={!move} onClick={() => !!move && exerciseMove(contractId, { ...move, promote })}>
          Submit Move
        </Button>
      </div>
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

  return (
    <div className="game-content">
      <GameBoard side={side} allowDrag={false} onDrop={(e) => {}} position={position} squareStyles={squareStyles} />
    </div>
  );
};

const GameBoard = (props: {
  side: Side;
  showPromoteDialog?: boolean;
  allowDrag: boolean;
  onDrop: ({ sourceSquare, targetSquare, piece }: { sourceSquare: any; targetSquare: any; piece: any }) => void;
  position: Position;
  squareStyles: Record<string, backgroundColorStyle>;
}) => {
  const { side, allowDrag, onDrop, position, squareStyles } = props;

  return (
    <div className="game-board">
      <Chessboard
        width={400}
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
