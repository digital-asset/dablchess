import React, {useEffect, useState} from "react";
import { TextField } from "@material-ui/core";
import { useLedger } from "@daml/react";
import { useUserState } from "../../../../context/UserContext";
import { useWellKnownParties } from "../../../../context/WellKnownPartiesContext";
import { useAliasMaps } from "../../../../context/AliasMapContext";
import useStyles from "./styles";
import { AliasRequest } from "@daml-ts/chess-0.4.0/lib/Alias";

export default function AliasField(){

  const classes = useStyles();
  const wellKnownParties = useWellKnownParties();
  const ledger = useLedger();
  const [alias, setAlias] = useState<string>("");
  const aliasMap = useAliasMaps();
  const userState = useUserState();
  useEffect(() => {
    if(userState.isAuthenticated){
      setAlias(aliasMap.toAlias(userState.party))
    }
  }, [userState, aliasMap])

  if(!userState.isAuthenticated){
    return null;
  }
  const user = userState.party;   // Assigning it here avoids a cast later

  function handleChange(event : React.ChangeEvent<HTMLInputElement>){
    setAlias(event.target.value)
  };
  async function onAliasEnter(newAliasValue : string){
    let args = { user
               , alias : newAliasValue
               , operator : wellKnownParties.userAdminParty
               };
    let aliasRequest = await ledger.create(AliasRequest, args);
    console.log(`Sent an aliasRequest ${JSON.stringify(args)} -> ${JSON.stringify(aliasRequest)}`);
    //Do not setAlias(newAliasValue) wait until we get a confirm.
  };
  function handleKeyDown(event : React.KeyboardEvent<HTMLInputElement>){
    if (event.key === "Enter") {
      onAliasEnter((event.target as HTMLInputElement).value);
    }
  };
  return (
    <TextField
      id="alias"
      InputProps={{
        classes: {
          input:classes.textField
        },
      }}
      FormHelperTextProps={{
        className:classes.formHelperText
      }}
      className={classes.textField}
      label="Alias"
      helperText="Enter an alias to for easier identification."
      // How can I create the effect that this alias has been set?
      value={alias}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
    />
  );
}