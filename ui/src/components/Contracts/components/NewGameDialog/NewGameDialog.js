import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormLabel
       , Radio, RadioGroup, TextField, } from '@material-ui/core';
//import DialogContentText from '@material-ui/core/DialogContentText';
import { wsBaseUrl, httpBaseUrl } from "../../../../config";
import { useUserState } from "../../../../context/UserContext";
import Ledger from "@daml/ledger";
import { GameProposal } from "@daml-ts/chess-1.0.0/lib/Chess";

export default function NewGameDialog({open, handleClose}) {

  const user = useUserState();
  let gameIdTextInput = React.createRef();
  let opponentTextInput = React.createRef();
  let operatorTextInput = React.createRef();
  const [side, setSide] = React.useState("White");

  function onClose(proposed){
    // User actually submitted the request.
    if(proposed && !!gameIdTextInput.value && !!opponentTextInput.value && !!operatorTextInput.value ){
      let gameProposalArgs =  { gameId:gameIdTextInput.value
                              , proposer:user.party
                              , opponent:opponentTextInput.value
                              , operator:operatorTextInput.value        // TODO. Need to look this up dynamically.
                              , desiredSide:side                        // in JS this has to be a string.
                              };
      console.log("A game proposal args:" + JSON.stringify(gameProposalArgs));
      try {
        let ledger = new Ledger({token:user.token, httpBaseUrl:httpBaseUrl, wsBaseUrl:wsBaseUrl});
        let gameProposalContract = ledger.create(GameProposal, gameProposalArgs);
        console.log("WE created a game: " + JSON.stringify(gameProposalContract));
      } catch(error) {
        alert("Error creating a gameProposal" + error + " " + JSON.stringify(gameProposalArgs));
      }
    }

    handleClose()
  }
  return (
    <div>
      <Dialog open={open} onClose={() => onClose(false)} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Propose a game</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="gameId"
            placeholder="Enter a unique id"
            label="Game Id"
            fullWidth
            inputRef={e => (gameIdTextInput = e)}
          />
          <TextField
            autoFocus
            margin="dense"
            id="opponent"
            placeholder="Who do you want to play against?"
            label="Opponent"
            fullWidth
            inputRef={e => (opponentTextInput = e)}
          />
          <TextField
            autoFocus
            margin="dense"
            id="operator"
            placeholder="Who will operate the contract game?"
            label="Ref"
            defaultValue="Ref"
            fullWidth
            inputRef={e => (operatorTextInput = e)}
          />
          <FormControl component="fieldset"  >
            <FormLabel component="legend">Desired Side</FormLabel>
            <RadioGroup aria-label="desired side" name="desiredSide" onChange={event => setSide(event.target.value)} >
              <FormControlLabel value="White" control={<Radio />} label="White" />
              <FormControlLabel value="Black" control={<Radio />} label="Black" />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onClose(true)} color="primary">
            Propose New Game
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}