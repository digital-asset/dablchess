import React, {useState, useEffect} from "react";
import { useStreamQuery } from "@daml/react";
import { createToken, dablLoginUrl, getWellKnownParties } from "../config";
import { Aliases } from "@daml-ts/chess-0.2.0/lib/Alias";


var UserStateContext = React.createContext();
var UserDispatchContext = React.createContext();

function userReducer(state, action) {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return { ...state, isAuthenticated: true, token: action.token, party: action.party };
    case "LOGIN_FAILURE":
      return { ...state, isAuthenticated: false };
    case "SIGN_OUT_SUCCESS":
      return { ...state, isAuthenticated: false };
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

function useWellKnownParties(){
  const [wellKnownParties, setWKP] = useState({});
  useEffect(() => {
      async function res() {
          const wkp = await getWellKnownParties();
          console.log(`wkp : ${JSON.stringify(wkp)}`);
          setWKP(wkp);
      };
      res();
    },[]);

  return wellKnownParties;
}

function useNaiveAliases() {
  const [aliasToParty, setAliasToParty] = useState({});
  const [partyToAlias, setPartyToAlias] = useState({});
  const aliases = useStreamQuery(Aliases);
  useEffect(() => {
    if(!aliases.loading && aliases.contracts.length > 0){
      setAliasToParty(aliases.contracts[0].payload.aliasToParty.textMap);
      setPartyToAlias(aliases.contracts[0].payload.partyToAlias.textMap);
      console.log(`Updated aliases ${JSON.stringify(aliasToParty)} ${JSON.stringify(partyToAlias)}`);
    }
  }, [aliases, aliasToParty, partyToAlias]);

  return [aliasToParty, partyToAlias];
}

function useAliases() {
  const [aliasToParty, partyToAlias] = useNaiveAliases();
  function toParty(alias){
    return alias in aliasToParty ? aliasToParty[alias] : alias;
  }
  function toAlias(party){
    return party in partyToAlias ? partyToAlias[party] : party;
  }
  return [toAlias, toParty];
}

function UserProvider({ children }) {
  const party = localStorage.getItem("daml.party")
  const token = localStorage.getItem("daml.token")

  var [state, dispatch] = React.useReducer(userReducer, {
    isAuthenticated: !!token,
    token,
    party
  });


  return (
    <UserStateContext.Provider value={state}>
      <UserDispatchContext.Provider value={dispatch}>
        {children}
      </UserDispatchContext.Provider>
    </UserStateContext.Provider>
  );
}

function useUserState() {
  var context = React.useContext(UserStateContext);
  if (context === undefined) {
    throw new Error("useUserState must be used within a UserProvider");
  }
  return context;
}

function useUserDispatch() {
  var context = React.useContext(UserDispatchContext);
  if (context === undefined) {
    throw new Error("useUserDispatch must be used within a UserProvider");
  }
  return context;
}

// ###########################################################

function loginUser(dispatch, party, userToken, history, setIsLoading, setError) {
  setError(false);
  setIsLoading(true);

  if (!!party) {
    const token = userToken || createToken(party)
    localStorage.setItem("daml.party", party);
    localStorage.setItem("daml.token", token);
    dispatch({ type: "LOGIN_SUCCESS", token, party });
    setError(null);
    setIsLoading(false);
    history.push("/app");
  } else {
    dispatch({ type: "LOGIN_FAILURE" });
    setError(true);
    setIsLoading(false);
  }
}

const loginDablUser = () => {
  window.location.assign(`https://${dablLoginUrl}`);
}

function signOut(event, dispatch, history) {
  event.preventDefault();
  localStorage.removeItem("daml.party");
  localStorage.removeItem("daml.token");

  dispatch({ type: "SIGN_OUT_SUCCESS" });
  history.push("/login");
}

export { UserProvider, useUserState, useUserDispatch, loginUser, loginDablUser, signOut, useAliases, useNaiveAliases, useWellKnownParties};