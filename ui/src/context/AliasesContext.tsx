import React, {useEffect, useState} from "react";
import { useStreamQueryAsPublic } from "@daml/dabl-react";
import { User } from "@daml-ts/chess-0.5.0";

export type AliasRecord = {
  alias : string
  partyId : string
}

function commonToAliasRecord(common : User.Common ) : AliasRecord {
  return {alias : common.userName, partyId: common.user};
}
export type AliasMap = Record<string,string>
export type Identify = (arg1:string) => string;

const AliasesContext = React.createContext<[AliasRecord[], AliasMap]>([[],{}]);

export function AliasesContextProvider({children}:{children:React.ReactNode}){

  const [aliases, setAliases] = useState<AliasRecord[]>([]);
  const [aliasMap, setAliasMap] = useState<AliasMap>({});
  const usernamesQuery = useStreamQueryAsPublic( User.UserName );

  useEffect(() => {
    //console.log(`usernamesQuery ${JSON.stringify(usernamesQuery)}`);
    if(!usernamesQuery.loading && !!usernamesQuery.contracts){
      let records = usernamesQuery.contracts.map(contract => commonToAliasRecord(contract.payload.common));
      setAliases(records);
      let aliasMap = Object.fromEntries( records.map(({alias, partyId}) => [partyId, alias]) );
      setAliasMap(aliasMap);
    }
  }, [usernamesQuery]);

  return (
    <AliasesContext.Provider value={[aliases, aliasMap]}>
      {children}
    </AliasesContext.Provider>
  )
}

export function useAliases():AliasRecord[]{
  var context = React.useContext(AliasesContext);
  if(context === undefined){
    throw new Error("useAliases must be within AliasesContext Provider");
  }
  return context[0]
}

export function useAliasMap():AliasMap{
  var context = React.useContext(AliasesContext);
  if(context === undefined){
    throw new Error("useAliases must be within AliasesContext Provider");
  }
  return context[1]
}

export function useIdentify():Identify{
  const aliasMap = useAliasMap();
  function identify(party:string):string{
    return (party in aliasMap) ? aliasMap[party] : party;
  }
  return identify;
}