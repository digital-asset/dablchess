
import React, {useState, useEffect} from "react";
import { getWellKnownParties } from "../config";

var WellKnownPartiesContext = React.createContext();

function WellKnownPartiesProvider({children}){
  const [wellKnownParties, setWKP] = useState({});
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
  var context = React.useContext(WellKnownPartiesContext);
  if(context === undefined){
    throw new Error("useWellKnownParties must be withink WellKnownPartiesContext Provider");
  }
  return context
}

export {WellKnownPartiesProvider, useWellKnownParties};