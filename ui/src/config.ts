import uuidv4 from "uuid/v4"
import * as jwt from "jsonwebtoken"

export const isLocalDev: boolean = process.env.NODE_ENV === "development"

export const ledgerId: string = isLocalDev ? "dablchess" : window.location.host.split(".")[0]

let apiUrl: string = window.location.host + (window.location.port ? ":" + window.location.port : "")

export const httpBaseUrl: string | undefined = isLocalDev ? undefined : `https://${apiUrl}/`

// Unfortunately, the development server of `create-react-app` does not proxy
// websockets properly. Thus, we need to bypass it and talk to the JSON API
// directly in development mode.
export const wsBaseUrl: string | undefined = isLocalDev ? "ws://localhost:7575/" : undefined

const applicationId: string = uuidv4()

export function createToken(party: string) {
    return jwt.sign(
        {
            "https://daml.com/ledger-api": {
                ledgerId,
                applicationId,
                admin: true,
                actAs: [party],
                readAs: [party],
            },
        },
        "secret"
    )
}

export const damlHubLoginUrl: string = `${apiUrl}/.hub/v1/auth/login`

export const defaultPartiesUrl: string = `${apiUrl}/.hub/v1/default-parties`

export const publicTokenUrl = `https://${apiUrl}/.hub/v1/public/token`

console.log(`Config:
  isLocalDev ${isLocalDev}
  ledgerId ${ledgerId}
  httpBaseUrl ${httpBaseUrl}
  wsBaseUrl ${wsBaseUrl}
  damlHubLoginUrl ${damlHubLoginUrl}
  defaultPartiesUrl ${defaultPartiesUrl}
  publicTokenUrl ${publicTokenUrl}
`)
