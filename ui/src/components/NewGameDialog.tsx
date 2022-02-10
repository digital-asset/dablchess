import React, { useState } from 'react';
import { useLedger } from '@daml/react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Input,
  Typography,
} from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { useUserState } from '../context/UserContext';
import { useDefaultParties } from '../context/DefaultPartiesContext';
import { useAliasMaps } from '../context/AliasMapContext';
import { GameProposal } from '@daml-ts/chess-0.5.0/lib/Chess';
import { Side } from '@daml-ts/chess-0.5.0/lib/Types';

type NewGameDialogProp = {
  open: boolean;
  handleClose: () => void;
};

class AutocompleteOption {
  constructor(public alias: string, public party: string) {}
}

export default function NewGameDialog({ open, handleClose }: NewGameDialogProp) {
  const defaultParties = useDefaultParties();
  const [gameId, setGameId] = useState<string>('');
  const [opponentField, setOpponentField] = useState<string>('');
  const [side, setSide] = useState<Side>(Side.White);
  const ledger = useLedger();
  const aliasMap = useAliasMaps();
  const user = useUserState();

  if (!user.isAuthenticated) {
    return null;
  }
  const proposer = user.party;

  const aliasesAsArray: AutocompleteOption[] = Object.entries(aliasMap.aliasToParty).map(
    ([alias, party]) => new AutocompleteOption(alias, party as string)
  );
  async function proposeGame(args: GameProposal) {
    try {
      let gameProposalPromise = await ledger.create(GameProposal, args);
      console.log('We created a game: ' + JSON.stringify(gameProposalPromise));
    } catch (error) {
      alert(
        'Error creating a gameProposal: \n' + error['errors'].join('. ') + ' \n With payload: \n' + JSON.stringify(args)
      );
    }
  }

  function onClose(proposed: boolean) {
    // User actually submitted the request.
    if (proposed && !!gameId && !!opponentField) {
      let opponent = aliasMap.toParty(opponentField);
      let gameProposalArgs = {
        gameId,
        proposer,
        opponent: opponent,
        operator: defaultParties.userAdminParty,
        desiredSide: side,
      };
      console.log('A game proposal args:' + JSON.stringify(gameProposalArgs));
      proposeGame(gameProposalArgs);
    }
    handleClose();
  }
  function handleChangeAutocompleteTextField(event: React.ChangeEvent<HTMLInputElement>) {
    setOpponentField(event.target.value);
  }
  function handleGetOptionLabel(option: any): string {
    return option instanceof AutocompleteOption ? option.alias : String(option);
  }
  return (
    <div>
      <Dialog open={open} onClose={() => onClose(false)} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">
          <Typography variant="h2" id="form-dialog-title">
            Propose a game
          </Typography>
        </DialogTitle>

        <DialogContent>
          <p>Game Id:</p>
          <Input
            autoFocus={true}
            margin="dense"
            id="gameId"
            placeholder="Enter a unique id"
            fullWidth
            onChange={(e) => setGameId(e.target.value)}
          />
          <Autocomplete
            id="opponent-autocomplete"
            options={aliasesAsArray}
            getOptionLabel={handleGetOptionLabel}
            freeSolo
            disableClearable
            renderInput={(params) => (
              <>
                <p>Opponent:</p>
                <Input
                  {...params}
                  margin="dense"
                  id="opponent"
                  placeholder="Who do you want to play against?"
                  fullWidth
                  onChange={handleChangeAutocompleteTextField}
                />
              </>
            )}
          />
          <FormControl component="fieldset">
            <p>Desired Side:</p>
            <RadioGroup
              aria-label="desired side"
              name="desiredSide"
              defaultValue={Side.White}
              onChange={(event) => setSide(event.target.value as Side)}
            >
              <FormControlLabel value={Side.White} control={<Radio />} label={Side.White} />
              <FormControlLabel value={Side.Black} control={<Radio />} label={Side.Black} />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onClose(true)}>Propose New Game</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
