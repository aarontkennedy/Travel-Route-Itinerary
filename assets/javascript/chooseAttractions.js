const attractionsLimit = 10;
let geocoder = null;

let firebaseItineraryKey = GetURLParameter('itinerarykey');

let numberOfGeocodeCallsToWaitFor = 0;
let dbSnapshot = null;

let placesService = null;

function returnToMainPageWithError(error) {
    // if the domain changes, this changes?!?!?!?!
    // i don't think you can replace with local files
    let url = 'https://tarose412.github.io/Travel-Route-Itinerary/index.html';
    error = encodeURIComponent(error);
    window.location.replace(`${url}?error=${error}`)
}


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
                    geocoder.geocode({
                            'location': dbSnapshot.waypoints[i].latlng
                        },
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
                            } else {
                                console.log('Geocode was not successful for the following reason: ' + status);
                            }

                        });
                }
            }

            addItineraryWaypoints();
        });
    } else {
        console.log("Return to original page, no key found.");
        returnToMainPageWithError("noKey");
    }

} // called by google maps api


// the following two functions run through the waypoints returned 
// from firebase and create them as fields in the form.
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

            for (let i = dbSnapshot.waypoints.length - 1; i >= 0; i--) {

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

    placesService = new google.maps.places.PlacesService($("<div>").addClass("hideMe").get(0));
    listenForRequestForMoreAttractionDetails();

    $("#itineraryContainer").on("click", "legend", function (event) {
        let waypoint = $(this).val();
        let waypointElement = $(this);
        if ($(this).attr("data-loaded")) {
            $(this).parent().children().show();
        } else { // request information from google places
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
                    //let attractionsContainer = $("<div>");
                    //attractionsContainer.addClass("attractions");

                    for (var i = 0; i < attractionsLimit /*results.length*/ ; i++) {
                        var place = results[i];
                        console.log(place);

                        let attraction = `<div class="attraction">
                            <label for="${place.place_id}">
                                <input type="checkbox" 
                                   value="${place.name}"
                                   id="${place.place_id}">
                            ${place.name}</label>
                            <span data-place-id="${place.place_id}" class="attractionDetail moreInfo">
                            more    
                            </span>
                            </div>`;
                        waypointElement.parent().append($(attraction));
                    }
                }
            });
        }
    });
}


function listenForRequestForMoreAttractionDetails() {

    $("#itineraryContainer").on("click", ".attractionDetail", function (event) {
        let element = $(this);

        let request = {
            placeId: $(this).attr("data-place-id")
        };

        placesService.getDetails(request, function (place, status) {
            element.removeClass("moreInfo");
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                console.log(place);

                // store the data somewhere accessible as a data-attr 
                element.attr("data-addr", place.formatted_address);
                element.attr("data-phone", place.formatted_phone_number);
                element.attr("data-website", place.website);
                element.attr("data-map-url", place.url);

                // create displayed html
                let html = `<div>${place.formatted_address}</div>`;
                if (place.formatted_phone_number) {
                    html += `<div>${place.formatted_phone_number}</div>`;
                }
                if (place.website) {
                    html += `<div><a href="${place.website}" target="_blank">${place.website}</a></div>`;
                }
                html += `<div><a href="${place.url}" target="_blank">See in Google Maps</a></div>`;

                element.html($(html));
                //debugger      
            }
        });

    });
}

var pdfDoc = new jsPDF();


// listen for form submit on itineraryContainer
function listenForFormSubmit() {

    // $("#itineraryContainer").on("submit", function (event) {
    $("#itineraryContainer").on("submit", function (event) {
        event.preventDefault();

        $("#itineraryKey").val(firebaseItineraryKey);

        // var itineraryCon = $("#itineraryContainer")[0];

        // console.log(itineraryCon);

        pdfDoc.text($("#itineraryContainer").text(), 5, 5);

        pdfDoc.save('roadRover.pdf');

        /*
        let arrayOfWaypointAttractions = [];

        // cruise through each waypoint on the page
        waypointElements = $("#itineraryContainer fieldset");
        console.log(waypointElements);
        
        for (let i = 0; i < waypointElements.length; i++) {
            let legendChild = $(waypointElements[i]).children("legend");
            console.log(legendChild);
            let singleWaypointAttractions = [];
            // cruise through each checked attraction in the waypoint
            let waypointsAttractions = legendChild.parent().children(".attraction");
            for (let j = 0; j < waypointsAttractions.length; j++) {
                debugger
                console.log(waypointsAttractions[j]);
                let checkbox = $(waypointsAttractions[j]).find("input")[0];
                let detailChild = $($(waypointsAttractions[j]).children(".attractionDetail")[0]);
                
                console.log(checkbox);
                console.log(detailChild);
                if (checkbox.checked) {
                    console.log(detailChild.attr("data-place-id"));
                    console.log(detailChild.attr("data-addr"));
                    console.log(detailChild.attr("data-phone"));
                    console.log(detailChild.attr("data-website"));
                    console.log(detailChild.attr("data-map-url"));
                    singleWaypointAttractions.push({
                        placeID: detailChild.attr("data-place-id"),
                        address: detailChild.attr("data-addr"),
                        phone: detailChild.attr("data-phone"),
                        website: detailChild.attr("data-website"),
                        googleMaps: detailChild.attr("data-map-url")
                    });
                }
            }
            arrayOfWaypointAttractions.push(singleWaypointAttractions);
        }
        console.log(arrayOfWaypointAttractions);
        debugger


        // store in firebase
*/
    });
}
listenForFormSubmit();