let geocoder = null;
let gMap = null;
let directionsDisplay = null;
let directionsService = null;
let distanceService = null;

// assume I was passed a starting point and end point
let startingPointAddress = "Minneapolis, MN";
let startingPointLatLng = null;
let destinationAddress = "Austin, TX";
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

    // get the lat and lng for the starting point and destination
    geocoder.geocode({ 'address': startingPointAddress }, function (results, status) {
        if (status == 'OK') {
            startingPointLatLng = {
                lat: results[0].geometry.location.lat(),
                lng: results[0].geometry.location.lng()
            };
            console.log(results[0]);
        }
        else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });

    geocoder.geocode({ 'address': destinationAddress }, function (results, status) {
        if (status == 'OK') {
            destinationLatLng = {
                lat: results[0].geometry.location.lat(),
                lng: results[0].geometry.location.lng()
            };
            console.log(results[0]);
        }
        else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });

}  // called by the google maps api callback



function displayRoute() {
    // poll and make sure we have the lat/lng for our two endpoints
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
            });

            // how far is this trip?
            // https://developers.google.com/maps/documentation/javascript/directions
            distanceService = new google.maps.DistanceMatrixService();
            distanceService.getDistanceMatrix(
                {
                    origins: [startingPointAddress, startingPointLatLng],
                    destinations: [destinationAddress, destinationLatLng],
                    travelMode: 'DRIVING',
                    /*transitOptions: TransitOptions,
                    drivingOptions: DrivingOptions,*/
                    unitSystem: google.maps.UnitSystem.IMPERIAL,
                    /*avoidHighways: Boolean,
                    avoidTolls: Boolean,*/
                }, callback);

            function callback(response, status) {
                // See Parsing the Results for the basics of a callback function.
                console.log(response.rows[0].elements[0]);
                let miles = response.rows[0].elements[0].distance.text;
                let duration = response.rows[0].elements[0].duration.text;
                $("#tripInfo").html(`
                <h3>Your Trip</h3>
                <div>Start: ${startingPointAddress}</div>
                <div>Destination: ${destinationAddress}</div>
                <div>Miles: ${miles}</div>
                <div>Drive Time: ${duration}</div>
                `);
            }

        }
    }, 250);
}
displayRoute();

function setUpCustomWaypointButtons() {
    // poll and make sure we have the lat/lng for our two endpoints
    let intervalID = setInterval(function () {
        if (startingPointLatLng && destinationLatLng) {
            clearInterval(intervalID);

            let midpointLatLng = { lat: (startingPointLatLng.lat + destinationLatLng.lat) / 2, lng: (startingPointLatLng.lng + destinationLatLng.lng) / 2 };

            $("#addWaypoint").on("click", function () {
                var marker = new google.maps.Marker({
                    position: midpointLatLng,
                    map: gMap,
                    title: 'Drag to where you want a waypoint.',
                    draggable: true,
                    label: "" + (waypointMarkers.length + 1)
                });
                waypointMarkers.push(marker);
            });

            $("#removeWaypoint").on("click", function () {
                if (waypointMarkers.length > 0) {
                    let markerToDelete = waypointMarkers.pop();
                    markerToDelete.setMap(null);
                    markerToDelete = null;
                }
            });

            $("#submitWaypoints").on("click", function () {

                tripLocations.push({ address: startingPointAddress, latlng: startingPointLatLng });
                for (let i = 0; i < waypointMarkers.length; i++) {
                    tripLocations.push({
                        address: "",
                        latlng: {
                            lat: waypointMarkers[i].position.lat(),
                            lng: waypointMarkers[i].position.lng()
                        }
                    });
                }
                tripLocations.push({ address: destinationAddress, latlng: destinationLatLng });
                console.log(tripLocations);
            });

            $("#restart").on("click", function () {
                alert($(this).text());
            });



        }
    }, 250);
}
setUpCustomWaypointButtons();