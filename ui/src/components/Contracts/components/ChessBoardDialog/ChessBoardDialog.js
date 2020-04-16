import React from "react";
import Chessboard from "chessboardjsx";
import { Dialog, DialogTitle } from "@material-ui/core";
import { useExercise } from "@daml/react";
import { ActiveSideOfGame } from "@daml-ts/chess-0.1.0/lib/Chess";
import { useStyles } from "./styles";

export default function ChessBoardDialog({open, onClose, game, active, contractId}) {
  const classes = useStyles();

  /* The defaults in the library are
  darkSquareStyle: { backgroundColor: 'rgb(181, 136, 99)' }
  lightSquareStyle: { backgroundColor: 'rgb(240, 217, 181)' }
  */
  // Tint these by 3/4
  let visibleDarkStyle = { backgroundColor: 'rgb(135, 102, 74)'};
  let visibleLightStyle = { backgroundColor: 'rgb(210, 189, 158)'};

  const exerciseMove = useExercise(ActiveSideOfGame.Move);
  let position = {};
  let squareStyles = {};
  let board = game.pieces.textMap;
  for (let k in board){
    // Types how I miss thee.
    let asInt = parseInt(k, 10);
    let col = Math.floor(asInt / 8);
    let row = asInt % 8;
    let coord = ['a','b','c','d','e','f','g','h'][col] + (row + 1);
    let darkPiece = (col % 2 === 0) ? asInt % 2 === 0 : asInt % 2 !== 0;
    let piece = board[k];
    squareStyles[coord] = darkPiece ? visibleDarkStyle : visibleLightStyle;
    if(piece !== null){
      let pl = piece.owner[0].toLowerCase() + (piece.tp === "Knight" ? "N" : piece.tp[0]);
      position[coord] = pl;
    }
  }
  function onDrop({sourceSquare, targetSquare, piece}){
    delete position[sourceSquare];
    position[targetSquare] = piece;
    let move = exerciseMove(contractId, { from : sourceSquare.toUpperCase()
                                        , to : targetSquare.toUpperCase()
                                        });
                                        //, promote : { tag : "None", value:null } });    // TODO
    console.log(`move: ${move}`);
    onClose();
  }
  function allowDrag({_piece, _sourceSquare }){
    console.log(`allowDrag ${active}`);
    return active;
  }
  return (
    <Dialog onClose={onClose} aria-labelledby="simple-dialog-title" open={open} maxWidth='md' fullWidth={true} >
      <DialogTitle id="simple-dialog-title">Move</DialogTitle>
      <Chessboard
        className={classes.chessboard}
        position={position}
        orientation={game.side.toLowerCase()}
        onDrop={onDrop}
        allowDrag={allowDrag}
        squareStyles={squareStyles}
        />
    </Dialog>
  );
}