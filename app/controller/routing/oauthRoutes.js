module.exports = function (app) {
    // get the necessary keys for connecting to google and getting
    // oAuth2 working
    const fs = require('fs');
    const path = require('path');
    const keyPath = path.join(__dirname, 'googleOAuth2.json');
    // we do this check because the googleOAuth2.json isn't going
    // to be uploaded to git or heroku - we use env values later
    let keys = { redirect_uris: [''] };
    if (fs.existsSync(keyPath)) {
        keys = require(keyPath).web;
    }

    // google signin + profile information
    const { google } = require('googleapis');
    const plus = google.plus('v1');
    const scopes = ['https://www.googleapis.com/auth/plus.me'];


    // create an oAuth client to authorize the API call
    // console.log(process.env.client_id);
    const oAuth2Client = new google.auth.OAuth2(
        process.env.client_id || keys.client_id,
        process.env.client_secret || keys.client_secret,
        process.env.redirect_uris || keys.redirect_uris[0]
    );

    /**
 * This is one of the many ways you can configure googleapis to use authentication credentials.  In this method, we're setting a global reference for all APIs.  Any other API you use here, like google.drive('v3'), will now use this auth client. You can also override the auth client at the service and method call levels.
 */
    google.options({ auth: oAuth2Client });

    // when a user clicks the sign in button, we redirect to google
    // where they login and we wait for a callback
    app.get("/signin", function (req, res) {

        // grab the url that will be used for authorization
        const authorizeUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent',
            scope: scopes.join(' ')
        });

        res.redirect(authorizeUrl); // send them to google
    });

    app.get("/oauth2callback", async function (req, res) {

        const querystring = require('querystring');
        const url = require('url');
        const qs = querystring.parse(url.parse(req.url).query);

        //console.log("awaiting token");
        try {
            const { tokens } = await oAuth2Client.getToken(qs.code);
            oAuth2Client.credentials = tokens;
        }
        catch (error) {
            // if i load the home page, the grabbing of the token fails
            console.error(error);
            return res.render("index", {signedIn: false});
        }

        //console.log("awaiting user info");
        const result = await plus.people.get({ userId: 'me' });
        console.log(result.data);
        
        // store the google information/user info here
        
        // we have that token in our url currently - redirect to get rid of it and pass the user id to the next step/page
        res.redirect("/chooseEndpoints/"+result.data.id);
    });

}