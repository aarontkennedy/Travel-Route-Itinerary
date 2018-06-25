
// Code for Step 2 page - get the preferred waypoints of the user
// can't be inside of document.ready because the initMap needs to be 
// global so it can be called as a callback by the google library
let geocoder = null;

let gMap = null;
let startingPointAddress = "";
let startingPointLatLng = null;
let destinationAddress = "";
let destinationLatLng = null;

$(document).ready(function () {

    function initialize() {

        geocoder = new google.maps.Geocoder();

        // just initialize the map to chicago while we get the lat/lng 
        // for the user's journey
        let mapElement = document.getElementById('map');

        gMap = new google.maps.Map(mapElement, {
            zoom: 8,
            center: new google.maps.LatLng(41.85, -87.65),
            scrollwheel: false
        });

        startingPointAddress = $("input[name=startingAddress]").val().trim();
        destinationAddress = $("input[name=endingAddress]").val().trim();

        let startPromise = getLatLng(startingPointAddress).then(function (result) {
            startingPointLatLng = result;
            $("input[name=startingAddressLatLng]").val(JSON.stringify(result));
        });
        let endPromise = getLatLng(destinationAddress).then(function (result) {
            destinationLatLng = result;
            $("input[name=endingAddressLatLng]").val(JSON.stringify(result));
        });

        Promise.all([startPromise, endPromise]).then(function () {
            // add the start and end points to the map
            displayRoute();
            printRouteStatistics();
            setUpCustomWaypointButtons();
        });

    }
    initialize();


    function getLatLng(address) {
        return new Promise(function (resolve, reject) {

            geocoder.geocode({ 'address': address }, function (results, status) {
                if (status == 'OK') {
                    let latLng = {
                        lat: results[0].geometry.location.lat(),
                        lng: results[0].geometry.location.lng()
                    };
                    resolve(latLng);
                }
                else {
                    throw new Error('Geocode was not successful for the following reason: ' + status);
                }
            });
        });
    }

    let waypointMarkers = [];
    let waypoints = [];
    function setUpCustomWaypointButtons() {

        // enables the button to add waypoints to the map
        $(".addWaypoint").on("click", function (e) {
            e.preventDefault();

            var marker = new google.maps.Marker({
                position: gMap.getCenter(),
                map: gMap,
                title: 'Drag to desired waypoint.',
                draggable: true,
                label: "" + (waypointMarkers.length + 1)
            });
            waypointMarkers.push(marker);
        });

        // remove the last placed waypoint
        $(".removeWaypoint").on("click", function (e) {
            e.preventDefault();

            if (waypointMarkers.length > 0) {
                let markerToDelete = waypointMarkers.pop();
                markerToDelete.setMap(null);
                markerToDelete = null;
            }
        });

        // the form is being submitted - make sure we grab the
        // chosen waypoint locations
        $("#chooseWayPointsForm").on("submit", function (e) {

            for (let i = 0; i < waypointMarkers.length; i++) {
                waypoints.push({
                    address: "",
                    lat: waypointMarkers[i].position.lat(),
                    lng: waypointMarkers[i].position.lng()
                });
            }
            // for ease later, add the starting point to the 
            // front of the list
            waypoints.unshift({
                address: startingPointAddress,
                lat: startingPointLatLng.lat,
                lng: startingPointLatLng.lng
            });
            // also add the destination to the end of the 
            // waypoints list
            waypoints.push({
                address: destinationAddress,
                lat: destinationLatLng.lat,
                lng: destinationLatLng.lng
            });

            // do i need to be concerned here that the length of the array get to 
            // long for the posting of the data?
            $("input[name=waypointsChosen]").val(JSON.stringify(waypoints));
        });
    }

    // this displays the route on the map returned by google
    // if we are "flying" to another continent then there won't be
    // a route and we just place the endpoints
    function displayRoute() {
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
            // status info at https://developers.google.com/maps/documentation/javascript/directions
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
    }

    function printRouteStatistics() {
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
                        <div class="stat miles">Miles: ${miles}</div>
                        <div class="stat time">Drive Time: ${duration}</div>
                        `);
            }
            else {
                console.log("No duration info for this trip.");
            }
        }
    }

});