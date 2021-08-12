
import { Int } from "@daml/types";
import React, {useState, useEffect} from "react";
import { isLocalDev, defaultPartiesUrl } from "../config";

type DamlhubPartyResponse = {
  displayName: string,
  identifier : string,
  "isLocal": boolean,
}

type DamlhubDefaultPartiesResponse = {
  result: [DamlhubPartyResponse],
  status: Int,
}

export type DefaultParties = {
  userAdminParty : string
  publicParty : string
}

export const emptyDefaultParties = {
  userAdminParty : "",
  publicParty : ""
}

export async function getDefaultParties() : Promise<DefaultParties> {
  if(isLocalDev){
    return { userAdminParty: "Ref", publicParty : "Ref"}
  } else {
    try {
      const response = await fetch('//' + defaultPartiesUrl );
      const damlhubResponse : DamlhubDefaultPartiesResponse = await response.json();
  
      const publicPartyResponse  = damlhubResponse.result.find(p => p.displayName === "Public")
      if (!publicPartyResponse) {
        throw new Error("response missing Public party")
      }

      const userAdminPartyResponse  = damlhubResponse.result.find(p => p.displayName ===  "UserAdmin")
      if (!userAdminPartyResponse) {
        throw new Error("response missing UserAdmin party")
      }

      const defaultParties : DefaultParties = {
        publicParty: publicPartyResponse.identifier,
        userAdminParty: userAdminPartyResponse.identifier
      }
      console.log(`Fetched default parties: ${JSON.stringify(defaultParties)}`)
      return defaultParties
    } catch(error){
      alert(`Error determining default parties: ${error}`);
      return emptyDefaultParties
    }
  }
}

var DefaultPartiesContext = React.createContext<DefaultParties>(emptyDefaultParties);

function DefaultPartiesProvider({children}:{children:React.ReactNode}){
  const [defaultParties, setDP] = useState(emptyDefaultParties);
  useEffect(() => {
    async function res() {
        const dp = await getDefaultParties();
        setDP(dp);
    };
    res();
  },[]);

  return (
    <DefaultPartiesContext.Provider value={defaultParties}>
      {children}
    </DefaultPartiesContext.Provider>
  )
}

function useDefaultParties(){
  var context = React.useContext(DefaultPartiesContext);
  if(context === undefined){
    throw new Error("useDefaultParties must be withink DefaultPartiesContext Provider");
  }
  return context
}

export {DefaultPartiesProvider, useDefaultParties};