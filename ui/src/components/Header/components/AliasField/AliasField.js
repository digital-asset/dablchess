import React, {useEffect, useState} from "react";
import { TextField } from "@material-ui/core";
import { useLedger } from "@daml/react";
import { useUserState } from "../../../../context/UserContext";
import { useWellKnownParties } from "../../../../context/WellKnownPartiesContext";
import { useAliasMaps } from "../../../../context/AliasMapContext";
import useStyles from "./styles";
import { AliasRequest } from "@daml-ts/chess-0.3.0/lib/Alias";

export default function AliasField(){

  const classes = useStyles();
  const userState = useUserState();
  const wellKnownParties = useWellKnownParties();
  const ledger = useLedger();
  const [alias, setAlias] = useState("");
  const aliasMap = useAliasMaps();
  useEffect(() => {
    setAlias(aliasMap.toAlias(userState.party))
  }, [userState, aliasMap])

  function handleChange(e){
    setAlias(e.target.value)
  };
  async function onAliasEnter(newAliasValue){
    let args = { user : userState.party
               , alias : newAliasValue
               , operator : wellKnownParties.userAdminParty
               };
    let aliasRequest = await ledger.create(AliasRequest, args);
    console.log(`Sent an aliasRequest ${JSON.stringify(args)} -> ${JSON.stringify(aliasRequest)}`);
    //Do not setAlias(newAliasValue) wait until we get a confirm.
  };
  function handleKeyDown(e){
    if (e.key === "Enter") {
      onAliasEnter(e.target.value);
    }
  };
  return (
    <TextField
      id="alias"
      InputProps={{
        classes: {
          underline: classes.textFieldUnderline,
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