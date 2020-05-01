import React from "react";
import Chessboard, {Piece as CPiece, Position} from "chessboardjsx";
import { Dialog, DialogTitle } from "@material-ui/core";
import { ContractId } from "@daml/types";
import { useLedger } from "@daml/react";
import { ActiveSideOfGame, Move, PassiveSideOfGame } from "@daml-ts/chess-0.2.0/lib/Chess";
import { Coord, Piece, PieceType, Side, SplitGameState } from "@daml-ts/chess-0.2.0/lib/Types";
import { useStyles } from "./styles";
import classes from "*.module.css";

type backgroundColorStyle = {
  backgroundColor : string
}

type moveArgs = {
  sourceSquare : string
  targetSquare : string
  piece : CPiece
}

function convertPiece(piece : Piece) : CPiece {
  const wb = piece.owner === Side.White ? "w" : "b";
  const t = piece.tp === PieceType.Knight ? "N" : piece.tp[0];
  return ((wb + t) as CPiece);
}

function toCoordAndDarkPiece(intCoord : string) : [string, boolean] {
    let asInt = parseInt(intCoord, 10);
    let col = Math.floor(asInt / 8);
    let row = asInt % 8;
    let coord = ['a','b','c','d','e','f','g','h'][col] + (row + 1);
    let darkPiece = (col % 2 === 0) ? asInt % 2 === 0 : asInt % 2 !== 0;
    return [coord, darkPiece];
}

interface ActiveContractId {
  kind : "active"
  contractId : ContractId<ActiveSideOfGame>
}

interface PassiveContractId {
  kind : "passive"
  contractId : ContractId<PassiveSideOfGame>
}

// TODO - It would be nice to isolate this example so that ContractId,
// CreateEvent or Template had the appropriate discrimant.
type OurContractId = ActiveContractId | PassiveContractId

type ChessBoardDialogProp = {
  open : boolean
  side : Side
  onClose : () => void
  game : SplitGameState
  c : OurContractId
  // Active can make moves while Passive (can't ..) is only for display.
}

export default function ChessBoardDialog({open, side, onClose, game, c} : ChessBoardDialogProp) {

  const classes = useStyles();

  /* The defaults in the library are
  darkSquareStyle: { backgroundColor: 'rgb(181, 136, 99)' }
  lightSquareStyle: { backgroundColor: 'rgb(240, 217, 181)' }
  */
  // Tint these by 3/4
  const visibleDarkStyle : backgroundColorStyle = { backgroundColor: 'rgb(135, 102, 74)'};
  const visibleLightStyle : backgroundColorStyle = { backgroundColor: 'rgb(210, 189, 158)'};
  const ledger = useLedger();
  let squareStyles : Record<string, backgroundColorStyle> = {};
  let position : Position = {};
  let board = game.pieces.textMap;
  for (let k in board){
    let [coord, darkPiece] = toCoordAndDarkPiece(k);
    let piece = board[k];
    squareStyles[coord] = darkPiece ? visibleDarkStyle : visibleLightStyle;
    if(piece !== null){
      position[coord] = convertPiece(piece);
    }
  }

  async function exerciseMove(contractId : ContractId<ActiveSideOfGame>, move : Move ){
    const [choiceReturnValue, events] = await ledger.exercise(ActiveSideOfGame.Move, contractId, move);
    console.log(`After moving ${JSON.stringify(choiceReturnValue)} ${JSON.stringify(events)}`);
  }

  let onDrop : (m : moveArgs) => void;
  let allowDrag : () => boolean;
  let title : string;
  switch(c.kind) {
    case "active" :
      onDrop = ({sourceSquare, targetSquare, piece}) => {
        delete position[sourceSquare];
        position[targetSquare] = piece;
        const from = Coord.decoder().runWithException(sourceSquare.toUpperCase());
        const to = Coord.decoder().runWithException(targetSquare.toUpperCase());
        const move : Move = { from, to, promote:null }; // TODO
        exerciseMove(c.contractId, move);
        onClose();
      }
      allowDrag = () => true;
      title = game.inCheck_ ? "In check!" : "Make your move";
      break;
    case "passive" :
      onDrop = e => {};
      allowDrag = () => false;
      title = game.inCheck_ ? "Check!" : "Waiting for your turn";
      break;
  }

  return (
    <Dialog onClose={onClose} aria-labelledby="simple-dialog-title" open={open} maxWidth='md' fullWidth={true} >
      <DialogTitle id="simple-dialog-title">{title}</DialogTitle>
      <div className={game.inCheck_ ? classes.checkedBoardDiv : classes.regularBoardDiv}>
        <Chessboard
          boardStyle={{margin:"auto"}}
          position={position}
          orientation={side.toLowerCase() as 'white' | 'black'}
          onDrop={onDrop}
          allowDrag={allowDrag}
          squareStyles={squareStyles}
        />
      </div>
    </Dialog>
  );
}