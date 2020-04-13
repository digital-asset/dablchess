import React from "react";
import Chessboard from "chessboardjsx";
import { Dialog, DialogTitle } from "@material-ui/core";
import { useExercise } from "@daml/react";
import { ActiveSideOfGame } from "@daml-ts/chess-1.0.0/lib/Chess";
import { useStyles } from "./styles";

export default function ChessBoardDialog({open, onClose, game, contractId}) {
  const classes = useStyles();
  console.log("In the game board the contractId: " + contractId);

  const exerciseMove = useExercise(ActiveSideOfGame.Move);
  let position = {};
  let board = game.pieces.textMap;
  for (let k in board){
    let piece = board[k];
    let pk = piece.coord.toLowerCase();
    let pl = piece.owner[0].toLowerCase() + (piece.tp === "Knight" ? "N" : piece.tp[0]);
    position[pk] = pl;
  }
  function onDrop({sourceSquare, targetSquare, piece}){
    delete position[sourceSquare];
    position[targetSquare] = piece;
    let move = exerciseMove(contractId, { from : sourceSquare.toUpperCase()
                                        , to : targetSquare.toUpperCase()
                                        });
                                        //, promote : { tag : "None", value:null } });    // TODO
    console.log("We moved! " + move);
    onClose();
  }
  return (
    <Dialog onClose={onClose} aria-labelledby="simple-dialog-title" open={open} maxWidth='md' fullWidth={true} >
      <DialogTitle id="simple-dialog-title">Move</DialogTitle>
      <Chessboard className={classes.chessboard} position={position}
        orientation={game.side.toLowerCase()}
        onDrop={onDrop}
        />
    </Dialog>
  );
}