import React, {useEffect, useState} from "react";
import { useStreamQuery } from "@daml/react";
import Ledger from "@daml/ledger";
import { Aliases } from "@daml-ts/chess-0.2.0/lib/Alias";
import { fetchPublicToken, httpBaseUrl, isLocalDev, wsBaseUrl } from "../config";

var AliasMapContext = React.createContext();

function AliasMapProvider({children}) {

  const [aliasToParty, setAliasToParty] = useState({});
  const [partyToAlias, setPartyToAlias] = useState({});

  function setFromContract(contract){
    let aliasToParty = contract.payload.aliasToParty.textMap;
    let partyToAlias = contract.payload.partyToAlias.textMap;
    console.log(`Setting aliases ${JSON.stringify(aliasToParty)} ${JSON.stringify(partyToAlias)}`);
    setAliasToParty(aliasToParty);
    setPartyToAlias(partyToAlias);
  };

  const aliases = useStreamQuery(Aliases);
  useEffect(() => {
    if(isLocalDev){
      console.log(`Let's do this locally`);
      if(!aliases.loading && aliases.contracts.length > 0){
        setFromContract(aliases.contracts[0]);
      }
    } else {
      async function viaPublicParty(){
        const publicPartyToken = await fetchPublicToken();
        console.log(`The public token is ${publicPartyToken}`);
        const publicPartyLedger = new Ledger({token:publicPartyToken, httpBaseUrl, wsBaseUrl});
        console.log(`The new ledger is ${JSON.stringify(publicPartyLedger)}`);
        const aliases = publicPartyLedger.streamQuery(Aliases);
        aliases.on('live', () => {});
        aliases.on('change', contracts => {
          setFromContract(contracts[0]);
        });
        aliases.on('close', closeEvent => {
          console.error('aliases stream: web socket closed', closeEvent);
        });
        return () => {
          console.debug(`unmount alias query`);
          aliases.close();
        };
      };
      viaPublicParty();
    }
  }, [aliases.loading, aliases.contracts]);

  function toParty(alias) {
    return alias in aliasToParty ? aliasToParty[alias] : alias;
  }
  function toAlias(party) {
    return party in partyToAlias ? partyToAlias[party] : party;
  }
  const aliasMap = {aliasToParty, partyToAlias, toAlias, toParty};
  return (
    <AliasMapContext.Provider value={aliasMap}>
      {children}
    </AliasMapContext.Provider>
  );
}

function useAliasMaps() {
  var context = React.useContext(AliasMapContext);
  if (context === undefined) {
    throw new Error("useAliasMaps must be used within a UserProvider");
  }
  return context;
}

export { AliasMapProvider, useAliasMaps };