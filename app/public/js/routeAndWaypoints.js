let geocoder = null;
let gMap = null;
let directionsDisplay = null;
let directionsService = null;
let distanceService = null;

let startingPointAddress = "";
let startingPointLatLng = null;
let destinationAddress = "";
let destinationLatLng = null;

let waypointMarkers = [];
let tripLocations = [];


function initMap() {
    geocoder = new google.maps.Geocoder();

    // just initialize the map to chicago while we get the lat/lng 
    // for the user's journey
    gMap = new google.maps.Map(document.getElementById('map'), {
        zoom: 8,
        center: new google.maps.LatLng(41.85, -87.65),
        scrollwheel: false
    });
/*
    // we should have an itinerary key and we can pull the city data
    // from firebase else epic fail and return to index.html
    if (firebaseItineraryKey) {
        database.ref(itineraryPath).child(firebaseItineraryKey).once('value').then(function (snapshot) {
            console.log(snapshot.val());
            let sv = snapshot.val();
            startingPointAddress = sv.start;
            startingPointLatLng = sv.startLatLng;
            destinationAddress = sv.end;
            destinationLatLng = sv.endLatLng;

            if (!startingPointLatLng) {
                // get the lat and lng for the starting point and destination
                geocoder.geocode({ 'address': startingPointAddress }, function (results, status) {
                    if (status == 'OK') {
                        startingPointLatLng = {
                            lat: results[0].geometry.location.lat(),
                            lng: results[0].geometry.location.lng()
                        };
                        database.ref(itineraryPath).child(firebaseItineraryKey).update({
                            startLatLng: startingPointLatLng
                        });
                        console.log(results[0]);
                    }
                    else {
                        console.log('Geocode was not successful for the following reason: ' + status);
                        // return to original page
                        returnToMainPageWithError("BadAddress");
                    }
                });
            }

            if (!destinationLatLng) {
                geocoder.geocode({ 'address': destinationAddress }, function (results, status) {
                    if (status == 'OK') {
                        destinationLatLng = {
                            lat: results[0].geometry.location.lat(),
                            lng: results[0].geometry.location.lng()
                        };
                        database.ref(itineraryPath).child(firebaseItineraryKey).update({
                            endLatLng: destinationLatLng
                        });
                        console.log(results[0]);
                    }
                    else {
                        console.log('Geocode was not successful for the following reason: ' + status);
                        // return to original page
                        returnToMainPageWithError("BadAddress");
                    }
                });
            }

            displayRoute();
            setUpCustomWaypointButtons();
        });

    }
    else {
        // return to original page
        returnToMainPageWithError("NoKey");
    }*/

}  // called by the google maps api callback

/*

function displayRoute() {
    // poll and make sure we have the lat/lng for our two endpoints
    // add a timeout?
    let intervalID = setInterval(function () {
        if (startingPointLatLng && destinationLatLng) {
            clearInterval(intervalID);

            directionsDisplay = new google.maps.DirectionsRenderer({ map: gMap });

            // Set destination, origin and travel mode.
            var directionRequest = {
                origin: startingPointLatLng,
                destination: destinationLatLng,
                travelMode: 'DRIVING'
            };

            // Pass the directions request to the directions service.
            directionsService = new google.maps.DirectionsService();
            directionsService.route(directionRequest, function (response, status) {
                console.log(response);
                // status info at 
                // https://developers.google.com/maps/documentation/javascript/directions
                if (status == 'OK') {
                    // Display the route on the map.
                    directionsDisplay.setDirections(response);
                }
                else {
                    // just display the two markers of start and end
                    let startMarker = new google.maps.Marker({
                        position: startingPointLatLng,
                        map: gMap,
                        title: startingPointAddress,
                        label: "Start"
                    });
                    let endMarker = new google.maps.Marker({
                        position: destinationLatLng,
                        map: gMap,
                        title: destinationAddress,
                        label: "Destination"
                    });
                    let bounds = new google.maps.LatLngBounds();
                    bounds.extend(startMarker.getPosition());
                    bounds.extend(endMarker.getPosition());
                    gMap.fitBounds(bounds);
                }
            });

            // how far is this trip?
            // https://developers.google.com/maps/documentation/javascript/directions
            distanceService = new google.maps.DistanceMatrixService();
            distanceService.getDistanceMatrix(
                {
                    origins: [startingPointAddress, startingPointLatLng],
                    destinations: [destinationAddress, destinationLatLng],
                    travelMode: 'DRIVING',
                    unitSystem: google.maps.UnitSystem.IMPERIAL,
                }, callback);

            function callback(response, status) {
                
                if (status == 'OK' && response.rows[0].elements[0].status != "ZERO_RESULTS") {
                    // See Parsing the Results for the basics of a callback function.
                    console.log(response.rows[0].elements[0]);
                    let miles = response.rows[0].elements[0].distance.text;
                    let duration = response.rows[0].elements[0].duration.text;
                    $("#tripInfo").html(`
                        <span>Start: ${startingPointAddress}</span>
                        <span>Destination: ${destinationAddress}</span>
                        <span>Miles: ${miles}</span>
                        <span>Drive Time: ${duration}</span>
                        `);
                }
                else {
                    console.log("No duration info for this trip.");
                }
            }

        }
    }, 250);
}

function setUpCustomWaypointButtons() {
    // poll and make sure we have the lat/lng for our two endpoints
    let intervalID = setInterval(function () {
        if (startingPointLatLng && destinationLatLng) {
            clearInterval(intervalID);

            $("#addWaypoint").on("click", function (e) {
                e.preventDefault();
                e.stopPropagation();

                var marker = new google.maps.Marker({
                    position: gMap.getCenter(),
                    map: gMap,
                    title: 'Drag to where you want a waypoint.',
                    draggable: true,
                    label: "" + (waypointMarkers.length + 1)
                });
                waypointMarkers.push(marker);
            });

            $("#removeWaypoint").on("click", function (e) {
                e.preventDefault();
                e.stopPropagation();

                if (waypointMarkers.length > 0) {
                    let markerToDelete = waypointMarkers.pop();
                    markerToDelete.setMap(null);
                    markerToDelete = null;
                }
            });

            $("#chooseWayPointsForm").on("submit", function (e) {
                $("#itineraryKey").val(firebaseItineraryKey);

                for (let i = 0; i < waypointMarkers.length; i++) {

                    tripLocations.push({
                        address: "",
                        latlng: {
                            lat: waypointMarkers[i].position.lat(),
                            lng: waypointMarkers[i].position.lng()
                        }
                    });
                }
                // it will be easier if we put the starting location at the front of the
                // waypoint array
                tripLocations.unshift({
                    address: startingPointAddress,
                    latlng: startingPointLatLng
                });
                // it will also be easier if we put the ending destination at the end of the
                // array    
                tripLocations.push({
                    address: destinationAddress,
                    latlng: destinationLatLng
                });
                // update the database with all the locations
                database.ref(itineraryPath).child(firebaseItineraryKey).update({
                    waypoints: tripLocations
                });
            });

            $("#restart").on("click", function (e) {
                e.preventDefault();
                e.stopPropagation();
                // return to original page
                returnToMainPageWithError("restart");
            });



        }
    }, 250); 
}*/