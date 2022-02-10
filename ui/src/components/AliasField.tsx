import React, { useEffect, useState } from 'react';
import { Input } from '@material-ui/core';
import { useLedger } from '@daml/react';
import { useUserState } from '../context/UserContext';
import { useDefaultParties } from '../context/DefaultPartiesContext';
import { useAliasMaps } from '../context/AliasMapContext';
import { AliasRequest } from '@daml-ts/chess-0.5.0/lib/Alias';
import { IconButton } from '@material-ui/core';
import { Edit, Close } from '@material-ui/icons';

export default function AliasField() {
  const defaultParties = useDefaultParties();
  const ledger = useLedger();
  const [alias, setAlias] = useState<string>();
  const [editing, setEditing] = useState(false);
  const aliasMap = useAliasMaps();
  const userState = useUserState();

  useEffect(() => {
    if (userState.isAuthenticated) {
      setAlias(aliasMap.toAlias(userState.party));
    }
  }, [userState, aliasMap]);

  if (!userState.isAuthenticated) {
    return null;
  }
  const user = userState.party; // Assigning it here avoids a cast later

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setAlias(event.target.value);
  }
  async function onAliasEnter(newAliasValue: string) {
    let args = { user, alias: newAliasValue, operator: defaultParties.userAdminParty };
    let aliasRequest = await ledger.create(AliasRequest, args);
    console.log(`Sent an aliasRequest ${JSON.stringify(args)} -> ${JSON.stringify(aliasRequest)}`);
    //Do not setAlias(newAliasValue) wait until we get a confirm.
  }
  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      onAliasEnter((event.target as HTMLInputElement).value);
      setEditing(false);
    }
  }

  if (editing) {
    return (
      <div>
        <div className="alias-form">
          <p>User Alias:</p>
          &nbsp;
          <Input
            id="alias"
            placeholder="Enter an alias to for easier identification."
            value={alias}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
          <IconButton onClick={() => setEditing(false)}>
            <Close />
          </IconButton>
        </div>
        <p className="p2">Enter an alias to for easier identification.</p>
      </div>
    );
  }

  return (
    <p>
      User Alias: {alias}
      <IconButton onClick={() => setEditing(true)}>
        <Edit />
      </IconButton>
    </p>
  );
}
