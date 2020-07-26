import * as jwt from "jsonwebtoken";

export const isLocalDev : boolean = process.env.NODE_ENV === 'development';

let host : string[] = window.location.host.split('.')

const applicationId = "dablchess"
export const ledgerId : string = isLocalDev ? applicationId : host[0];

let apiUrl : string[] = host.slice(1)
apiUrl.unshift('api')

const portPartOfUrl : string = window.location.port ? ':' + window.location.port : '';
export const httpBaseUrl : string | undefined = isLocalDev ? undefined : ('https://' + apiUrl.join('.') + portPartOfUrl  + '/data/' + ledgerId + '/');

// Unfortunately, the development server of `create-react-app` does not proxy
// websockets properly. Thus, we need to bypass it and talk to the JSON API
// directly in development mode.
export const wsBaseUrl : string | undefined = isLocalDev ? 'ws://localhost:7575/' : undefined;

export function createToken(party : string) {
  return jwt.sign({ "https://daml.com/ledger-api": { ledgerId, applicationId, admin: true, actAs: [party], readAs: [party] } }, "secret")
}
// For local development
export function partyNameFromLocalJwtToken(token:string){
  let decoded = jwt.decode(token);
  if(!decoded || typeof(decoded) === "string"){
    console.log(`local jwt not correctly format ${token}`);
    return "";
  } else {
    return decoded["https://daml.com/ledger-api"]["actAs"][0];
  }
}

let loginUrl : string[] = host.slice(1)
loginUrl.unshift('login')

export const dablLoginUrl : string = loginUrl.join('.') + portPartOfUrl + '/auth/login?ledgerId=' + ledgerId;

export const wellKnownUrl : string = host.join('.') + portPartOfUrl + '/.well-known/dabl.json';

export const publicTokenUrl = 'https://' + apiUrl.join(".") + portPartOfUrl + '/api/ledger/' + ledgerId+ '/public/token';

console.log(`Config:
  isLocalDev ${isLocalDev}
  ledgerId ${ledgerId}
  portPartOfUril ${portPartOfUrl}
  httpBaseUrl ${httpBaseUrl}
  wsBaseUrl ${wsBaseUrl}
  loginUrl ${loginUrl}
  dablLoginUrl ${dablLoginUrl}
  wellKnownUrl ${wellKnownUrl}
  publicTokenUrl ${publicTokenUrl}
`);

export const daml_party_key = applicationId + ".daml.party";
export const daml_token_key = applicationId + ".daml.token";

export const defaultPublicToken = isLocalDev ? createToken('Public') : undefined;

