const attractionsLimit = 10;
let geocoder = null;

let firebaseItineraryKey = GetURLParameter('itinerarykey');

let numberOfGeocodeCallsToWaitFor = 0;
let dbSnapshot = null;

let placesService = null;

function initialize() {
    geocoder = new google.maps.Geocoder();

    // we should have an itinerary key and we can pull the city data
    // from firebase else epic fail
    if (firebaseItineraryKey) {
        $("#itineraryKey").val(firebaseItineraryKey);
        database.ref(itineraryPath).child(firebaseItineraryKey).once('value').then(function (snapshot) {
            console.log(snapshot.val());
            dbSnapshot = snapshot.val();

            for (let i = 0; i < dbSnapshot.waypoints.length; i++) {
                if (!dbSnapshot.waypoints[i].address && dbSnapshot.waypoints[i].latlng) {

                    numberOfGeocodeCallsToWaitFor++;
                    geocoder.geocode({ 'location': dbSnapshot.waypoints[i].latlng },
                        function (results, status) {

                            numberOfGeocodeCallsToWaitFor--;
                            if (status == 'OK') {
                                console.log(results);
                                let bestAddressIndex = ((results.length) ? 1 : 0);

                                for (let j = 0; j < results.length; j++) {
                                    if (results[j].types.indexOf("locality") != -1) {
                                        bestAddressIndex = j;
                                        break;
                                    }
                                }
                                console.log(i);
                                dbSnapshot.waypoints[i].address =
                                    results[bestAddressIndex].formatted_address;
                                // i know this is inefficient, but it should work
                                database.ref(itineraryPath).child(firebaseItineraryKey).update({
                                    waypoints: dbSnapshot.waypoints
                                });
                            }
                            else {
                                console.log('Geocode was not successful for the following reason: ' + status);
                            }

                        });
                }
            }

            addItineraryWaypoints();
        });
    }
    else {
        alert("epic fail");
        // return to original page
    }

} // called by google maps api



// Philip, you are probably going to want to change the following two functions to 
// make space for printing information about the attractions

let itineraryContainer = $("#itineraryContainer");
function addWaypoint(address, latlng, ) {
    let node = $(`<fieldset>
        <legend data-address="${address}" 
                data-lat="${latlng.lat}" 
                data-lng="${latlng.lng}" 
                data-loaded="">
            ${address}
        </legend>
        </fieldset>`);
    itineraryContainer.prepend(node);
}


function addItineraryWaypoints() {

    // DO NOT CHANGE The next five lines of code
    let intervalID = setInterval(function () {
        // we need to wait for the geocode calls to return;
        if (numberOfGeocodeCallsToWaitFor < 1 && dbSnapshot) {
            clearInterval(intervalID);

            for (let i = 0; i < dbSnapshot.waypoints.length; i++) {

                if (dbSnapshot.waypoints[i].address) {
                    addWaypoint(dbSnapshot.waypoints[i].address,
                        dbSnapshot.waypoints[i].latlng);
                }
            }
            listenForWaypointInfoRequest();
        }
    }, 250);
}


function listenForWaypointInfoRequest() {
    // not displaying this map, just passing it in....
    //let pyrmont = new google.maps.LatLng(-33.8665433, 151.1956316);
    //let map = new google.maps.Map(document.getElementById('map'),
    //    { center: pyrmont, zoom: 15 });
    placesService = new google.maps.places.PlacesService($("<div>").addClass("hideMe").get(0));
    listenForRequestForMoreAttractionDetails();

    $("#itineraryContainer").on("click", "legend", function (event) {
        let waypoint = $(this).val();
        let waypointElement = $(this);
        if ($(this).attr("data-loaded")) {
            $(this).parent().children().show();
        }
        else { // request information from google places
            $(this).attr("data-loaded", "true");

            let request = {
                location: {
                    lat: parseFloat(waypointElement.attr("data-lat")),
                    lng: parseFloat(waypointElement.attr("data-lng"))
                },
                radius: '15000',
                query: 'attractions'
            };

            placesService.textSearch(request, function (results, status) {
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    let attractionsContainer = $("<div>");
                    attractionsContainer.addClass("attractions");

                    for (var i = 0; i < attractionsLimit/*results.length*/; i++) {
                        var place = results[i];
                        console.log(place);

                        let attraction = `<div class="attraction">
                            <input type="checkbox" 
                                   value="${place.name}"
                                   id="${place.place_id}"><label for="${place.place_id}">${place.name}</label>
                            <span data-place-id="${place.place_id}" class="attractionDetail">
                            more    
                            </span>
                            </div>`;
                        attractionsContainer.append($(attraction));
                    }
                    waypointElement.parent().append(attractionsContainer);
                }
            });
        }
    });

}


function listenForRequestForMoreAttractionDetails() {

    $("#itineraryContainer").on("click", ".attractionDetail", function (event) {
        alert($(this).attr("data-place-id"));

        let request = { placeId: $(this).attr("data-place-id") };
        debugger
        placesService.getDetails(request, function (place, status) {
            debugger
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                console.log(place);          
                debugger      
            }
        });

    });
}
