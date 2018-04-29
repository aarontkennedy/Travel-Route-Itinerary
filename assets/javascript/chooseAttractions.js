let geocoder = null;

let firebaseItineraryKey = GetURLParameter('itineraryKey');

let numberOfGeocodeCallsToWaitFor = 0;
let dbSnapshot = null;

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
                                alert('Geocode was not successful for the following reason: ' + status);
                            }

                        });
                }
            }

            paintPageWithItineraryInformation();
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
function waypointHTML(address) {
    return $(`<p>${address}</p>`);
}
function addWaypoint(node) {
    itineraryContainer.append(node);
}


function paintPageWithItineraryInformation() {

    // DO NOT CHANGE The next five lines of code
    let intervalID = setInterval(function () {
        // we need to wait for the geocode calls to return;
        if (numberOfGeocodeCallsToWaitFor < 1 && dbSnapshot) {
            clearInterval(intervalID);

            for (let i = 0; i < dbSnapshot.waypoints.length; i++) {

                // Philip, you may want to change this and add to this
                if (dbSnapshot.waypoints[i].address) {
                    addWaypoint(waypointHTML(dbSnapshot.waypoints[i].address));
                }










            }





        }
    }
        , 250);
}