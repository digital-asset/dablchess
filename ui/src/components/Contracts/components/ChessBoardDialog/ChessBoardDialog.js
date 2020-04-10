import React from "react";
import Chessboard from "chessboardjsx";
import { Dialog, DialogTitle } from "@material-ui/core";
import { useExercise } from "@daml/react";
import { ActiveSideOfGame } from "@daml-ts/chess-1.0.0/lib/Chess";
import { useStyles } from "../../styles";

export default function ChessBoardDialog({open, onClose, game, contractId}) {
  console.log("In the game board the contractId: " + contractId);
  //const classes = useStyles();

  const exerciseMove = useExercise(ActiveSideOfGame.Move);
  let position = {}
  let board = game.pieces.textMap;
  var k;
  for (k in board){
    let piece = board[k];
    var pk = piece.coord.toLowerCase();
    var pl = piece.owner[0].toLowerCase() + piece.tp[0];
    //console.log( pk + " => " + pl);
    position[pk] = pl;
  }
  function onDrop({sourceSquare, targetSquare, piece}){
    console.log( "moved " + piece + " from" + sourceSquare + " to " + targetSquare);
    delete position[sourceSquare];
    position[targetSquare] = piece;
    console.log("Going to move " + contractId);
    var move = exerciseMove(contractId, { from : sourceSquare.toUpperCase()
                                        , to : targetSquare.toUpperCase()
                                        });
                                        //, promote : { tag : "None", value:null } });    // TODO
    console.log("We moved! " + move);
    onClose();
  }

  return (
    // maxWidth='md' fullWidth={true} >
    <Dialog onClose={onClose} aria-labelledby="simple-dialog-title" open={open} fullScreen={true} >
      <DialogTitle id="simple-dialog-title">Move</DialogTitle>
      <Chessboard position={position}
        orientation={game.side.toLowerCase()}
        onDrop={onDrop}
        />
    </Dialog>
  );
}