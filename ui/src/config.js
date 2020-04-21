import uuidv4 from "uuid/v4";
import * as jwt from "jsonwebtoken";

export const isLocalDev = process.env.NODE_ENV === 'development';

let host = window.location.host.split('.')

export const ledgerId = isLocalDev ? "dablchess" : host[0];

let apiUrl = host.slice(1)
apiUrl.unshift('api')

const portPartOfUrl = window.location.port ? ':' + window.location.port : '';
export const httpBaseUrl = isLocalDev ? undefined : ('https://' + apiUrl.join('.') + portPartOfUrl  + '/data/' + ledgerId + '/');

// Unfortunately, the development server of `create-react-app` does not proxy
// websockets properly. Thus, we need to bypass it and talk to the JSON API
// directly in development mode.
export const wsBaseUrl = isLocalDev ? 'ws://localhost:7575/' : undefined;

const applicationId = uuidv4();

export const createToken = party => jwt.sign({ "https://daml.com/ledger-api": { ledgerId, applicationId, admin: true, actAs: [party], readAs: [party] } }, "secret")

let loginUrl = host.slice(1)
loginUrl.unshift('login')

export const dablLoginUrl = loginUrl.join('.') + portPartOfUrl + '/auth/login?ledgerId=' + ledgerId;

export async function getWellKnownParties() {
  if(isLocalDev){
    return { userAdminParty: 'Ref', publicParty : 'Ref'}
  } else {
    try {
      let wellKnownUrl = host.join('.') + portPartOfUrl + '/.well-known/dabl.json';
      const response = await fetch('//' + wellKnownUrl );
      const dablJson = await response.json();
      console.log(`dablJson ${JSON.stringify(dablJson)}`);
      return dablJson
    } catch(error){
      alert(`Error determining well known parties ${error}`);
      return {};
    }
  }
}
/*
export async function fetchPublicToken() {
  if(isLocalDev){
    return ""
  } else {
    try {
      const response = await fetch('//' + host.join(".") + portPartOfUrl + '/api/ledger/public/token', { method: 'POST' });
      const jsonResp = await response.json();
      const accessToken = jsonResp['access_token'];
      return accessToken;
    } catch(error){
      alert(`Error fetching public token ${error}`);
      return "";
    }
}
*/