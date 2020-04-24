import React from 'react';
import { useLedger } from "@daml/react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormLabel
       , Radio, RadioGroup, TextField, } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { useNaiveAliases, useUserState, useWellKnownParties } from "../../../../context/UserContext";
import { GameProposal } from "@daml-ts/chess-0.2.0/lib/Chess";

export default function NewGameDialog({open, handleClose}) {

  const user = useUserState();
  const wellKnownParties = useWellKnownParties();
  let gameIdTextInput = React.createRef();
  let opponentTextInput = React.createRef();
  const [side, setSide] = React.useState("White");
  const ledger = useLedger();
  const [aliasToParty] = useNaiveAliases();

  let aliasesAsArray = Object.entries(aliasToParty).map(([alias, party]) => { return {alias, party} });
  async function proposeGame(args){
    try {
      let gameProposalContract = await ledger.create(GameProposal, args);
      console.log("We created a game: " + JSON.stringify(gameProposalContract));
    } catch(error) {
      alert("Error creating a gameProposal" + error + " " + JSON.stringify(args));
    }
  }

  function onClose(proposed){
    // User actually submitted the request.
    if(proposed && !!gameIdTextInput.value && !!opponentTextInput.value ){
      let opponent = opponentTextInput.value in aliasToParty ? aliasToParty[opponentTextInput.value] : opponentTextInput.value;
      let gameProposalArgs =  { gameId:gameIdTextInput.value
                              , proposer:user.party
                              , opponent:opponent
                              , operator:wellKnownParties.userAdminParty
                              , desiredSide:side                        // in JS this has to be a string.
                              };
      console.log("A game proposal args:" + JSON.stringify(gameProposalArgs));
      proposeGame(gameProposalArgs);
    }
    handleClose()
  }
  return (
    <div>
      <Dialog open={open} onClose={() => onClose(false)} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Propose a game</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus={true}
            margin="dense"
            id="gameId"
            placeholder="Enter a unique id"
            label="Game Id"
            fullWidth
            inputRef={e => (gameIdTextInput = e)}
          />
          <Autocomplete
            id="opponent-autocomplete"
            autoComplete={true}
            options={aliasesAsArray}
            getOptionLabel={(option) => option.alias}
            renderInput={(params) => <TextField
                                        {...params}
                                        margin="dense"
                                        id="opponent"
                                        placeholder="Who do you want to play against?"
                                        label="Opponent"
                                        fullWidth
                                        inputRef={e => (opponentTextInput = e)}
                                        /> }
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