$(document).ready(function () {

    // Code for Step 1 page - get starting and ending locations
    // this code obviously initializes the auto complete for the address input
    function initializeAddressAutocomplete() {
        $(".geocomplete").geocomplete();
        /* // Investiage this - can it put lat/long into the form before submission
        $(".find").click(function () {
            $(this).parents(".location").find(".geocomplete").trigger("geocode");
        });*/
    };
    initializeAddressAutocomplete();

    // we need to get the cities requested if the form is valid
    // then create/start the itinerary with the two cities.
    // go to the itinerary page
    let cityForm = $("#citySelection");
    function setUpListenForFormSubmission() {

        cityForm.on("submit", function (event) {
            // validates the input from the user's name
            if (cityForm[0].checkValidity() === false) {
                event.stopPropagation();
                cityForm[0].classList.add('was-validated');
            }
        });
    }
    setUpListenForFormSubmission();

});


// Code for Step 2 page - get the preferred waypoints of the user
// can't be inside of document.ready because the initMap needs to be 
// global so it can be called as a callback by the google library
let geocoder = null;

function initGeocoder() {
    geocoder = new google.maps.Geocoder();
    return geocoder;
}

let gMap = null;
let startingPointAddress = "";
let startingPointLatLng = null;
let destinationAddress = "";
let destinationLatLng = null;

// this function is called as a callback by the google library
function initMap() {
    $(document).ready(function () {
        initGeocoder();

        // just initialize the map to chicago while we get the lat/lng 
        // for the user's journey
        let mapElement = document.getElementById('map');

        // only want to run this code if the map exists
        if (mapElement) {
            gMap = new google.maps.Map(mapElement, {
                zoom: 8,
                center: new google.maps.LatLng(41.85, -87.65),
                scrollwheel: false
            });

            startingPointAddress = $("input[name=startingAddress]").val().trim();
            destinationAddress = $("input[name=endingAddress]").val().trim();

            let start = getLatLng(startingPointAddress).then(function (result) {
                startingPointLatLng = result;
                $("input[name=startingAddressLatLng]").val(JSON.stringify(result));
            });
            let end = getLatLng(destinationAddress).then(function (result) {
                destinationLatLng = result;
                $("input[name=endingAddressLatLng]").val(JSON.stringify(result));
            });

            Promise.all([start, end]).then(function () {
                // add the start and end points to the map
                displayRoute();
                printRouteStatistics();
                setUpCustomWaypointButtons();
            });

        }
    });
}


function getLatLng(address) {
    return new Promise(function (resolve, reject) {
        if (!geocoder) {
            initGeocoder();
        }
        geocoder.geocode({ 'address': address }, function (results, status) {
            if (status == 'OK') {
                let latLng = {
                    lat: results[0].geometry.location.lat(),
                    lng: results[0].geometry.location.lng()
                };
                resolve(latLng);
            }
            else {
                reject('Geocode was not successful for the following reason: ' + status); // what should i do?
            }
        });
    });
}

let waypointMarkers = [];
let waypointLatLngs = [];
function setUpCustomWaypointButtons() {
    console.log(startingPointLatLng);
    console.log(destinationLatLng);

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

    $(".removeWaypoint").on("click", function (e) {
        e.preventDefault();

        if (waypointMarkers.length > 0) {
            let markerToDelete = waypointMarkers.pop();
            markerToDelete.setMap(null);
            markerToDelete = null;
        }
    });

    $("#chooseWayPointsForm").on("submit", function (e) {

        for (let i = 0; i < waypointMarkers.length; i++) {
            waypointLatLngs.push({
                //address: "",
                latlng: {
                    lat: waypointMarkers[i].position.lat(),
                    lng: waypointMarkers[i].position.lng()
                }
            });
        }

        $("input[name=waypointsChosen]").val(JSON.stringify(waypointLatLngs));
    });
}

function displayRoute() {

    if (!(startingPointLatLng) || !(destinationLatLng)) {
        console.log("Something bad happened, no lat/lng to display?");
        return;
    }
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
