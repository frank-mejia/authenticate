# Authenticate API Docs

### POST /v1/account
Creates a new user account

#### Parameters
| Location | Name | Type | Required | Description |
| -------- | ---- | ---- | -------- | ----------- |
| body | `name` | string | true | Users full name |
| body | `email` | string | true | Users e-mail address |
| body | `password` | string | true | Users password |

#### Response
<table>
    <thead>
        <tr>
            <th> Code </th>
            <th> Body </th>
            <th> Description </th>
        </tr>
    </thead>
    <tbody>
        <tr><td> 200 </td><td> <pre lang="javascript">{
  "id": Users Id,
  "name": Users name,
  "email": Users Email
}</pre> </td><td> Authentication was successful </td></tr>
<tr><td> 422 </td><td> None </td><td> Account already exists </td></tr>
    </tbody>
</table>

### GET /v1/accounts
Get all user accounts

#### Parameters
| Location | Name | Type | Required | Description |
| -------- | ---- | ---- | -------- | ----------- |
| body | `token` | string | true | A valid access token |

#### Response
<table>
    <thead>
        <tr>
            <th> Code </th>
            <th> Body </th>
            <th> Description </th>
        </tr>
    </thead>
    <tbody>
        <tr><td> 200 </td><td> <pre lang="javascript">{
  "accounts": [{
  	"id" Users id,
    "name": Users name,
    "email": Users email
  }]
}</pre> </td><td> Account retrieval was successfull </td></tr>
<tr><td> 401 </td><td> None </td><td> Supplied token is invalid </td></tr>
    </tbody>
</table>


### POST /v1/authenticate
If the supplied email and password match, a refresh and access token pair is returned.

#### Parameters
| Location | Name | Type | Required | Description |
| -------- | ---- | ---- | -------- | ----------- |
| body | `email` | string | true | Users e-mail address |
| body | `password` | string | true | Users password |

#### Response
<table>
    <thead>
        <tr>
            <th> Code </th>
            <th> Body </th>
            <th> Description </th>
        </tr>
    </thead>
    <tbody>
        <tr><td> 200 </td><td> <pre lang="javascript">{
  "accessToken": token,
  "refreshToken": token
}</pre> </td><td> Authentication was successful </td></tr>
<tr><td> 400 </td><td> None </td><td> Record does not exist </td></tr>
<tr><td> 422 </td><td> None </td><td> Account already exists </td></tr>
    </tbody>
</table>


### POST /v1/token/revoke
Revokes either a refresh or an access token

#### Parameters
| Location | Name | Type | Required | Description |
| -------- | ---- | ---- | -------- | ----------- |
| body | `type` | string | true | Type of the token to be revoked. Valid types are either 'refresh' or 'access' |
| body | `token` | string | true | Token |

#### Response
<table>
    <thead>
        <tr>
            <th> Code </th>
            <th> Body </th>
            <th> Description </th>
        </tr>
    </thead>
    <tbody>
        <tr><td> 200 </td><td> <pre lang="javascript">{
  "message": "Token revoked successfully"
}</pre> </td><td> The token was successfully revoked </td></tr>
<tr><td> 400 </td><td> None </td><td> The request contains invalid parameters </td></tr>
<tr><td> 401 </td><td> None </td><td> Supplied token is invalid </td></tr>
<tr><td> 403 </td><td> None </td><td> Token has expired </td></tr>
    </tbody>
</table>


### POST /v1/token/refresh
Refreshes an access token using a refresh token

#### Parameters
| Location | Name | Type | Required | Description |
| -------- | ---- | ---- | -------- | ----------- |
| body | `refreshToken` | string | true | Refresh token |
| body | `accessToken` | string | true | Access token |

#### Response
<table>
    <thead>
        <tr>
            <th> Code </th>
            <th> Body </th>
            <th> Description </th>
        </tr>
    </thead>
    <tbody>
        <tr><td> 200 </td><td> <pre lang="javascript">{
  "accessToken": token,
  "refreshToken": token,
}</pre> </td><td> Successfully refreshed access token </td></tr>
<tr><td> 400 </td><td> None </td><td> The request contains invalid parameters </td></tr>
<tr><td> 403 </td><td> None </td><td> Token has expired </td></tr>
    </tbody>
</table>
