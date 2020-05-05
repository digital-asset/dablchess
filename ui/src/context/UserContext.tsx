import React from "react";
import {History} from "history";
import { createToken, dablLoginUrl } from "../config";

type LoggedOutUser = {
  isAuthenticated : false
}

type LoggedInUser = {
  isAuthenticated : true
  token : string
  party : string
}

type UserState = LoggedOutUser | LoggedInUser

var UserStateContext = React.createContext<UserState>({isAuthenticated:false});
var UserDispatchContext = React.createContext({} as React.Dispatch<LoginAction>);

type LoginSuccess = {
  type : "LOGIN_SUCCESS"
  token : string
  party : string
}

type LoginFailure = {
  type : "LOGIN_FAILURE"
}

type SignOutSuccess = {
  type : "SIGN_OUT_SUCCESS"
}

type LoginAction = LoginSuccess | LoginFailure | SignOutSuccess

function userReducer(state : UserState, action : LoginAction) : UserState {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return { isAuthenticated: true, token: action.token, party: action.party };
    case "LOGIN_FAILURE":
      return { isAuthenticated: false };
    case "SIGN_OUT_SUCCESS":
      return { isAuthenticated: false };
  }
}


function UserProvider({children} : {children:React.ReactNode}) {
  const party = localStorage.getItem("daml.party")
  const token = localStorage.getItem("daml.token")

  const initialArgs : UserState = (!!party && !!token) ? { isAuthenticated: true, token, party } : {isAuthenticated : false};
  var [state, dispatch] = React.useReducer<React.Reducer<UserState, LoginAction>>(userReducer, initialArgs);

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

function loginUser( dispatch : React.Dispatch<LoginAction>
                  , party : string
                  , userToken : string
                  , history : History
                  , setIsLoading : (arg0:boolean) => void
                  , setError : (arg0:boolean) => void): void {
  setError(false);
  setIsLoading(true);

  if (!!party) {
    const token = userToken || createToken(party)
    localStorage.setItem("daml.party", party);
    localStorage.setItem("daml.token", token);
    dispatch({ type: "LOGIN_SUCCESS", token, party });
    setError(false);
    setIsLoading(false);
    history.push("/app");
  } else {
    dispatch({ type: "LOGIN_FAILURE" });
    setError(true);
    setIsLoading(false);
  }
}

function loginDablUser(): void {
  window.location.assign(`https://${dablLoginUrl}`);
}

function signOut( event : React.FormEvent
                , dispatch : React.Dispatch<LoginAction>
                , history : History): void{
  event.preventDefault();
  localStorage.removeItem("daml.party");
  localStorage.removeItem("daml.token");

  dispatch({ type: "SIGN_OUT_SUCCESS" });
  history.push("/login");
}

export { UserProvider, useUserState, useUserDispatch, loginUser, loginDablUser, signOut };