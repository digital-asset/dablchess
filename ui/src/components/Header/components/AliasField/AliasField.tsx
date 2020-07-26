import React, {useState} from "react";
import { TextField } from "@material-ui/core";
import { useLedger } from "@daml/react";
import { User } from "@daml-ts/chess-0.4.1/";
import useStyles from "./styles";

// A text field to control the alias of the current user.

type AliasFieldProps = {
  session: User.Session.CreateEvent
}

export default function AliasField({session}:AliasFieldProps){
  const classes = useStyles();

  const currentUserName = session.payload.common.userName;
  const ledger = useLedger();
  const [userName, setUserName] = useState<string>(currentUserName);
  async function rename(){
    if(userName !== currentUserName){
      let res = await ledger.exercise( User.Session.Rename, session.contractId, { newUserName:userName } );
      console.log(`Asked to rename: ${JSON.stringify(res)}!`);
    }
  }

  return (
    <TextField
      className={classes.textField}
      size="small"
      variant="outlined"
      label="An alias for identification"
      onChange={e => setUserName(e.target.value)}
      value={userName}
      onBlur={() => rename()}
      onKeyDown={ e => {
          if(e.key === "Enter"){
            rename()
          }
        }}
      error={userName.length === 0}
      helperText={userName.length === 0 ? "Can't be empty." : null}
      />
  );
}