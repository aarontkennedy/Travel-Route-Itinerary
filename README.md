# Travel-Route-Itinerary

This web app helps you plan a road trip.
Enter 2 cities.
Select Waypoints along the way where you want to stop.
We will provide attractions for you to checkout near the desired waypoints.

http://aarontkennedy.github.io/Travel-Route-Itinerary

I worked on this project with Tony and Phillip.  I wrote most of the javascript.  Most of the javascript for the pages was pretty straight forward.  However, the script for the ChooseAttractions.html page had a lot of issues and I found it was much easier to write it with objects.  I had an object for each of the waypoints and each waypoint created objects for its attractions.  This allowed the objects to do their own updating as async calls returned data.


If you want to run this repo on your own, you will need a couple of additional files.  You will need a googleOAuth2.json from Google oAuth2 credentials service in the routing file folder.  It should look like: 

```
{"web":
{"client_id":"xxx",
"project_id":"xxx",
"auth_uri":"xxx",
"token_uri":"xxx,
"auth_provider_x509_cert_url":"xxx",
"client_secret":"xxx",
"redirect_uris":["https://xxx/oauth2callback"],
"javascript_origins":["https://xxx"]}}
```

You also need a mySQL database.  The connection info is in a file called mySQLkeys.json and is in the data folder.  It should look like: 
```
{
    "host": "xxx",
    "port": 3306,
    "user": "xxx",
    "password": "xxx",
    "database": "xxx"
}
```

If you look in the code, you can also reference process.env variables to get the above connection/credentials.
