import React, {useEffect, useState} from "react";
import { useStreamQuery } from "@daml/react";
import Ledger, { CreateEvent } from "@daml/ledger";
import { Aliases } from "@daml-ts/chess-0.4.1/lib/Alias";
import { httpBaseUrl, isLocalDev, publicTokenUrl, wsBaseUrl } from "../config";

async function fetchPublicToken() : Promise<string> {
  if(isLocalDev){
    return ""
  } else {
    try {
      const response = await fetch(publicTokenUrl, { method: 'POST' });
      const jsonResp = await response.json();
      const accessToken = jsonResp['access_token'];
      return accessToken;
    } catch(error){
      alert(`Error fetching public token ${error}`);
      return "";
    }
  }
};

class AliasMap{
  constructor( public aliasToParty : Record<string, string>
             , public partyToAlias : Record<string, string>
             , public toAlias : (party:string) => string
             , public toParty : (alias:string) => string){}
}

var AliasMapContext = React.createContext(new AliasMap({},{},(_)=>"",(_)=>""));

function AliasMapProvider({children}:{children:React.ReactNode}) {

  const [aliasToParty, setAliasToParty] = useState<Record<string,string>>({});
  const [partyToAlias, setPartyToAlias] = useState<Record<string,string>>({});

  function setFromContract(contract : CreateEvent<Aliases, any, any>){
    let aliasToParty = contract.payload.aliasToParty.textMap;
    let partyToAlias = contract.payload.partyToAlias.textMap;
    console.log(`Setting aliases ${JSON.stringify(aliasToParty)} ${JSON.stringify(partyToAlias)}`);
    setAliasToParty(aliasToParty);
    setPartyToAlias(partyToAlias);
  };

  const aliases = useStreamQuery(Aliases);
  useEffect(() => {
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
    if(isLocalDev){
      console.log(`Let's do this locally`);
      if(!aliases.loading && aliases.contracts.length > 0){
        setFromContract(aliases.contracts[0]);
      }
    } else {
      viaPublicParty();
    }
  }, [aliases.loading, aliases.contracts]);

  function toParty(alias : string) : string {
    return alias in aliasToParty ? aliasToParty[alias] : alias;
  }
  function toAlias(party : string) : string {
    return party in partyToAlias ? partyToAlias[party] : party;
  }
  const aliasMap = {aliasToParty, partyToAlias, toAlias, toParty};
  return (
    <AliasMapContext.Provider value={aliasMap}>
      {children}
    </AliasMapContext.Provider>
  );
}

function useAliasMaps() : AliasMap {
  var context = React.useContext(AliasMapContext);
  if (context === undefined) {
    throw new Error("useAliasMaps must be used within a UserProvider");
  }
  return context;
}

export { AliasMapProvider, useAliasMaps };