import React, {useEffect, useState} from "react";
import { TextField } from "@material-ui/core";
import { useLedger } from "@daml/react";
import { useAliases, useWellKnownParties,useUserState } from "../../../../context/UserContext";
import { useStyles } from "./styles";
import { AliasRequest } from "@daml-ts/chess-0.2.0/lib/Alias";

export default function AliasField(){

  const classes = useStyles();
  const userState = useUserState();
  const wellKnownParties = useWellKnownParties();
  const ledger = useLedger();
  const [alias, setAlias] = useState('');
  const [toAlias] = useAliases();
  useEffect(() => {
    setAlias(toAlias(userState.party));
  }, [toAlias, userState]);

  async function onAliasEnter(newAliasValue){
    let args = { user : userState.party
               , alias : newAliasValue
               , operator : wellKnownParties.userAdminParty
               };
    let aliasRequest = await ledger.create(AliasRequest, args);
    console.log(`Sent an aliasRequest ${JSON.stringify(args)} -> ${JSON.stringify(aliasRequest)}`);
    //setAlias(newAliasValue);
  };

  console.log(`What are my classes ${'textFieldUnderline' in classes} \n ${JSON.stringify(classes)}`);
  return (
    <TextField
      id="alias"
      className={classes.textField}
      helperText="Enter an alias to for easier identification."
      // How can I create the effect that this alias has been set?
      value={alias}
      onChange={e => setAlias(e.target.value)}
      onKeyDown={e => {
        if (e.key === "Enter" && !!e.target.value) {
          onAliasEnter(e.target.value);
        }
      }}
    />
  );
}