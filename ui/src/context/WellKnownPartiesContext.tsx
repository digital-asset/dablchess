
import React, {useState, useEffect} from "react";
import { isLocalDev, wellKnownUrl } from "../config";

export type WellKnownParties = {
  userAdminParty : string
  publicParty : string
}

export const emptyWellKnownParties = {
  userAdminParty : "",
  publicParty : ""
}

export async function getWellKnownParties() : Promise<WellKnownParties> {
  if(isLocalDev){
    return { userAdminParty: "Ref", publicParty : "Ref"}
  } else {
    try {
      const response = await fetch('//' + wellKnownUrl );
      const dablJson = await response.json();
      return dablJson
    } catch(error){
      alert(`Error determining well known parties ${error}`);
      return emptyWellKnownParties
    }
  }
}

const WellKnownPartiesContext = React.createContext<WellKnownParties>(emptyWellKnownParties);

function WellKnownPartiesProvider({children}:{children:React.ReactNode}){
  const [wellKnownParties, setWKP] = useState(emptyWellKnownParties);
  useEffect(() => {
    async function res() {
        const wkp = await getWellKnownParties();
        setWKP(wkp);
    };
    res();
  },[]);

  return (
    <WellKnownPartiesContext.Provider value={wellKnownParties}>
      {children}
    </WellKnownPartiesContext.Provider>
  )
}

function useWellKnownParties(){
  const context = React.useContext(WellKnownPartiesContext);
  if(context === undefined){
    throw new Error("useWellKnownParties must be withink WellKnownPartiesContext Provider");
  }
  return context
}

export {WellKnownPartiesProvider, useWellKnownParties};