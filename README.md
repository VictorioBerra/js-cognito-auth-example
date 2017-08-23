# This is an Example Project
## Learn how to use AWS API Gateway AWS_IAM Authentication via Cognito Federated Identities using Cognito User Pool logins.

Tie together Cognito Federated Identities with Cognito User Pools to hit a Lambda integrated APIG secured via AWS_IAM temporray credentials.

#### How it works

I noticed there is a lot of confusion for developers trying to link together all these concepts. Understandably because the easiest route to obtaining the JWT from user pools has to be done with front-end scripts [identity](https://github.com/aws/amazon-cognito-identity-js)/[auth](https://github.com/aws/amazon-cognito-auth-js) which are lacking in documentation with outdated code examples.

We use [node-serverless](LINK) to create the AWS stack for us (I recommend learning to do this by hand), and then we use the [amazon-cognito-identity.js library](https://github.com/aws/amazon-cognito-identity-js) to get our JWT from Cognito User Pools. With the JWT we can use `CognitoIdentityCredentials()` to auth and get an `accessKeyId`, `secretAccessKey` and a `sessionToken` from [Cognito Federated Identities](https://console.aws.amazon.com/cognito).

### Install and run

You will need to set the variables in /src/config.js. There is nothing insecure about exposing any of these values to the end user.

```javascript
export default {
  region: 'us-east-1',
  IdentityPoolId: 'us-east-1:XXXXXXXXXXXXXX',
  UserPoolId: 'us-east-1_XXXXXXXXXXXXXX',
  UserPoolAppClientId: 'XXXXXXXXXXXXXX'
}
```

Run node-serverless to build out the backend. (uses Cloud Formation to create some sample Lambda functions, the APIG, And all needed IAM Roles/Perms, and the Cognito Federated Identities and Pools)

```bash
npm install
export AWS_ACCESS_KEY_ID="XXXXXXXXXXXX"
export AWS_SECRET_ACCESS_KEY="XXXXXXXXXXXX"
npx serverless deploy
npm run watch
```

See `src/main.js` for the code and make sure to carefully read the comments in the code. If you want the apigClient to work go to your APIG and snag the generated SDK for Javascript and dump all the files in dist.