import React, {useState} from "react";
import { Button, ButtonGroup, Dialog, DialogTitle } from "@material-ui/core";
import Chessboard, {Piece as CPiece, Position} from "chessboardjsx";
import { useLedger } from "@daml/react";
import { Coord, Piece, PieceType, Side } from "@daml-ts/chess-0.5.0/lib/Types";
import { useStyles } from "./styles";

import { ActiveSideOfGame, ActiveMove, ActiveDrawClaim, EndGameProposal, Move, PassiveSideOfGame} from "@daml-ts/chess-0.5.0/lib/Chess";
import { DisplayableGameContract, splitGame } from "../../common";

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

type PromotePieceTypeDialogProp = {
  open : boolean
  setPromotion : (arg0:PieceType) => void
}

function PromotePieceTypeDialog({open, setPromotion} : PromotePieceTypeDialogProp ) {
  return (
    <Dialog aria-labelledby="simple-dialog-title" open={open} maxWidth='md' fullWidth={true} >
      <DialogTitle id="simple-dialog-title">Promote pawn to?</DialogTitle>
      <ButtonGroup>
        <Button onClick={()=>setPromotion(PieceType.Queen)}>Queen</Button>
        <Button onClick={()=>setPromotion(PieceType.Bishop)}>Bishop</Button>
        <Button onClick={()=>setPromotion(PieceType.Knight)}>Knight</Button>
        <Button onClick={()=>setPromotion(PieceType.Rook)}>Rook</Button>
      </ButtonGroup>
    </Dialog>
  )
}

/* The defaults in the library are
darkSquareStyle: { backgroundColor: 'rgb(181, 136, 99)' }
lightSquareStyle: { backgroundColor: 'rgb(240, 217, 181)' }
*/
// Tint these by 3/4
const visibleDarkStyle : backgroundColorStyle = { backgroundColor: 'rgb(135, 102, 74)'};
const visibleLightStyle : backgroundColorStyle = { backgroundColor: 'rgb(210, 189, 158)'};


type GamePageProp = {
  c : DisplayableGameContract
}

function toSide(c:DisplayableGameContract){
  let s : Side = c.payload.side;
  switch(s){
    case Side.White:
      return "white";
    case Side.Black:
      return "black";
  }
}

function draggable(c:DisplayableGameContract){
  return c.templateId === ActiveSideOfGame.templateId;
}

function toTitle(c:DisplayableGameContract){
  switch (c.templateId){
    case ActiveSideOfGame.templateId:
      return c.payload.active.inCheck_ ? "In check!" : "Please make your move.";
    case ActiveMove.templateId:
      return "Waiting for opponent to respond.";
    case ActiveDrawClaim.templateId:
      return "You claimed a draw."
    case EndGameProposal.templateId:
      return "You proposed an end."
    case PassiveSideOfGame.templateId:
      return c.payload.passive.inCheck_ ? "Check!" : "Waiting for your turn.";
  }
}

export default function GamePage({c} : GamePageProp) {
  console.log(`The game is ${JSON.stringify(c)}`);

  const classes = useStyles();
  const ledger = useLedger();

  const [promote, setPromote] = useState<PieceType | null>(null);
  const [openPromoteDialog, setOpenPromoteDialog] = useState(false);
  function setPromotion(pt : PieceType) : void {
    setPromote(pt);
    setOpenPromoteDialog(false);
  }

  let squareStyles : Record<string, backgroundColorStyle> = {};
  let position : Position = {};
  let game = splitGame(c);
  let board = game.pieces.textMap;
  for (let k in board){
    let [coord, darkPiece] = toCoordAndDarkPiece(k);
    let piece = board[k];
    squareStyles[coord] = darkPiece ? visibleDarkStyle : visibleLightStyle;
    if(piece !== null){
      position[coord] = convertPiece(piece);
    }
  }

  async function exerciseMove(contract : ActiveSideOfGame.CreateEvent, move : Move ){
    const [choiceReturnValue, events] = await ledger.exercise(ActiveSideOfGame.Move, contract.contractId, move);
    console.log(`After moving ${JSON.stringify(choiceReturnValue)} ${JSON.stringify(events)}`);
  }

  function allowDrag(){ return draggable(c); }

  let title = toTitle(c);
  let onDrop : ((m : moveArgs) => void) | undefined;
  switch(c.templateId) {
    case ActiveSideOfGame.templateId:
      onDrop = ({sourceSquare, targetSquare, piece}) => {
        delete position[sourceSquare];
        position[targetSquare] = piece;
        const from = Coord.decoder.runWithException(sourceSquare.toUpperCase());
        const to = Coord.decoder.runWithException(targetSquare.toUpperCase());
        const lastRow = parseInt(targetSquare[1], 10);
        if( (piece === "wP" && lastRow === 8 && game.side === Side.White)
          || (piece === "bP" && lastRow === 1 && game.side === Side.Black) ){
            console.log('Time to promote!')
            setOpenPromoteDialog(true);
        }
        const move : Move = { from, to, promote};
        exerciseMove(c, move);
      };
      break;
    default:
      onDrop = undefined;
  }
  console.log(`Ok ${JSON.stringify(c)}`);

  return (
    <>
      <h1>{title}</h1>
      <div className={game.inCheck_ ? classes.checkedBoardDiv : classes.regularBoardDiv}>
        <PromotePieceTypeDialog
          open={openPromoteDialog}
          setPromotion={setPromotion}
        />
        <Chessboard
          allowDrag={allowDrag}
          boardStyle={{margin:"auto"}}
          onDrop={onDrop}
          orientation={toSide(c)}
          position={position}
          squareStyles={squareStyles}
        />
      </div>
    </>
  );
}