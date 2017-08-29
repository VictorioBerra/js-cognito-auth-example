import {
    Config,
    CognitoIdentityCredentials
}
    from 'aws-sdk';

import {
    CognitoUserPool,
    AuthenticationDetails,
    CognitoUser
}
    from 'amazon-cognito-identity-js';

import appConfig from './config';

import './style.css';

// Globall set region and CognitoIdentityCredentials
// This gets you to the point where you can start calling services with your cognito unauthed role
Config.region = appConfig.region;
Config.credentials = new CognitoIdentityCredentials({
    IdentityPoolId: appConfig.IdentityPoolId
});

document.getElementById('authedState').value = 'UNAUTHENTICATED ACCESS READY.';

// At this point, we can obtain authathed credentials and an identityId manually if you would like.
// NOTE
// If you are using something like `var awsS3 = new AWS.S3( ... ` The SDK will automatically refresh credentials for you
// You don't need to call `credentials.get()`
Config.credentials.get(function() {
    
    document.getElementById('identityId').value = Config.credentials.identityId;

    document.getElementById('getAuthedCredentials').addEventListener('click', function() {

        document.getElementById('getAuthedCredentials').disabled = true;
        document.getElementById('getAuthedCredentials').textContent = 'Working... please wait';

        // Build up a new CognitoUser and auth them
        // Careful with the order here!
        // amazon-cognito-identity-js is expecting certian things to exist in the aws-sdk and some things are being set by the library when you new up things.
        const userPool = new CognitoUserPool({
            UserPoolId: appConfig.UserPoolId,
            ClientId: appConfig.UserPoolAppClientId,
        });

        var authenticationData = {
            Username: document.getElementById('username').value,
            Password: document.getElementById('password').value,
        };
        var authenticationDetails = new AuthenticationDetails(authenticationData);

        var userData = {
            Username: document.getElementById('username').value,
            Pool: userPool
        };

        var cognitoUser = new CognitoUser(userData);

        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function(result) {
                
                // With this token, you could set your APIG to use a Cognito User Pool Authorizor on your method authentication settings.
                // However, if you restrict to AWS_IAM you can use as many different Cognito Identities you want to auth.
                document.getElementById('token').value = result.getIdToken().jwtToken;

                var CognitoIdentityCredentialsParams = {
                    IdentityId: Config.credentials.identityId,
                    IdentityPoolId: appConfig.IdentityPoolId,
                    Logins: {}
                };
                CognitoIdentityCredentialsParams.Logins['cognito-idp.us-east-1.amazonaws.com/' + appConfig.UserPoolId] = result.getIdToken().jwtToken;

                Config.credentials = new CognitoIdentityCredentials(CognitoIdentityCredentialsParams, {
                    region: appConfig.region
                });

                Config.credentials.get(function(err) {
                    if (err) {
                        console.log('error in autheticatig AWS ' + err);
                    }
                    else {
                        //console.log('WORKED!!! ' + Config.credentials.identityId);

                        document.getElementById('authedState').value = 'AUTHENTICATED';
                        document.getElementById('authedState').style.backgroundColor = 'green';

                        document.getElementById('identityId').value = Config.credentials.identityId;
                        document.getElementById('accessKeyId').value = Config.credentials.accessKeyId;
                        document.getElementById('secretAccessKey').value = Config.credentials.secretAccessKey;
                        document.getElementById('sessionToken').value = Config.credentials.sessionToken;

                        document.getElementById('testUtilities').style.visibility = 'visible';

                        // If youre using the APIG Auto-generated SDK you can new up a apigClientFactory and start making requests like this:
                        document.getElementById('makeApiCallBtn').addEventListener('click', function() {

                            // On window for easier manipulation through console
                            window.apigClient = window.apigClientFactory.newClient({
                                accessKey: Config.credentials.accessKeyId,
                                secretKey: Config.credentials.secretAccessKey,
                                sessionToken: Config.credentials.sessionToken, //OPTIONAL: If you are using temporary credentials you must include the session token
                            });

                            window.apigClient.YOUR_METHOD()
                                .then(function(res) {
                                    console.log(res);
                                });

                        });

                    }
                });

            },
            newPasswordRequired: function(userAttributes) {
                // User was signed up by an admin and must provide new
                // password and required attributes, if any, to complete
                // authentication.

                // the api doesn't accept this field back
                delete userAttributes.email_verified;

                // Get these details and call
                cognitoUser.completeNewPasswordChallenge(document.getElementById('newPassword').value, userAttributes, this);
            },
            onFailure: function(err) {
                alert(err);
            }
        });

    });


});
