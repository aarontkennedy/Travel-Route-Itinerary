# Travel-Route-Itinerary

This web app helps you plan a road trip.
Enter 2 cities.
Select Waypoints along the way where you want to stop.
We will provide attractions for you to checkout near the desired waypoints.

http://aarontkennedy.github.io/Travel-Route-Itinerary

I worked on this project with Tony and Phillip.  I wrote most of the javascript.  Most of the javascript for the pages was pretty straight forward.  However, the script for the ChooseAttractions.html page had a lot of issues and I found it was much easier to write it with objects.  I had an object for each of the waypoints and each waypoint created objects for its attractions.  This allowed the objects to do their own updating as async calls returned data.
