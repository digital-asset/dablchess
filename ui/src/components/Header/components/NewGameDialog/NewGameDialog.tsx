import React, {useState} from 'react';
import { useLedger } from "@daml/react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormLabel
       , Radio, RadioGroup, TextField, } from '@material-ui/core';
import { useUserState } from "../../../../context/UserContext";
import { useWellKnownParties } from "@daml/dabl-react";
import { GameProposal } from "@daml-ts/chess-0.5.0/lib/Chess";
import { Side } from "@daml-ts/chess-0.5.0/lib/Types";
import AliasedTextField from '../../../AliasedTextField/AliasedTextField';

type NewGameDialogProp = {
  open : boolean
  handleClose : () => void
}

export default function NewGameDialog({open, handleClose} : NewGameDialogProp) {

  const wellKnownParties = useWellKnownParties();
  const [gameId, setGameId] = useState<string>("");
  const [opponent, setOpponent] = useState<string|null>(null);
  const [side, setSide] = useState<Side>(Side.White);
  const ledger = useLedger();
  const user = useUserState();

  if(!user.isAuthenticated){
    return null;
  }

  const proposer = user.party;
  async function proposeGame(args: GameProposal){
    try {
      let gameProposalPromise = await ledger.create(GameProposal, args);
      console.log("We created a game: " + JSON.stringify(gameProposalPromise));
    } catch(error) {
      alert(`Error creating a gameProposal ${JSON.stringify(error)} - ${JSON.stringify(args)}`);
    }
  }

  function onClose(proposed:boolean){
    if(proposed && !!gameId && !!opponent){
      let gameProposalArgs =  { gameId
                              , proposer
                              , opponent
                              , operator:wellKnownParties.userAdminParty
                              , desiredSide:side
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
            onChange={e => setGameId(e.target.value)}
          />
          <AliasedTextField
            placeholder="opponent"
            onChange={(arg1) =>{
              if(arg1 !== null){
                setOpponent(arg1)
              }
            }}
          />
          <FormControl component="fieldset"  >
            <FormLabel component="legend">Desired Side</FormLabel>
            <RadioGroup
                aria-label="desired side"
                name="desiredSide"
                defaultValue={Side.White}
                onChange={event => setSide(event.target.value as Side)} >
              <FormControlLabel value={Side.White} control={<Radio />} label={Side.White} />
              <FormControlLabel value={Side.Black} control={<Radio />} label={Side.Black} />
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
