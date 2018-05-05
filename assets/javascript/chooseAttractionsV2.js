const attractionsLimit = 5;

let geocoder = null;
let placesService = null;

let firebaseItineraryKey = GetURLParameter('itinerarykey');

// helper function to send us to the index page when there is an unexpected error
function returnToMainPageWithError(error) {
    // if the domain changes, this changes?!?!?!?!
    // i don't think you can replace with local files
    let url = 'https://tarose412.github.io/Travel-Route-Itinerary/index.html';
    error = encodeURIComponent(error);
    window.location.replace(`${url}?error=${error}`)
}


function Attraction(name, placeID, parentNode) {
    this.name = name;
    this.placeID = placeID;
    this.parentNode = parentNode;
    this.loadedDetails = false;
    this.address = "";
    this.phone = "";
    this.website = "";
    this.googleMaps = "";

    // print what we no now
    this.container = $(`<div class="attraction">`);
    this.hide();
    this.label = $(`<label for="${this.placeID}">${this.name}</label>`);
    this.checkbox = $(`<input type="checkbox" value="${this.name}" 
        id="${this.placeID}"></input>`);

    this.label.prepend(this.checkbox);
    this.container.append(this.label);
    this.parentNode.append(this.container);
}

Attraction.prototype.firebaseObject = function () {
    return {
        name: this.name,
        googlePlaceID: this.placeID,
        address: this.address,
        phone: (this.phone ? this.phone : ""),
        website: (this.website ? this.website : ""),
        googleMapsURL: this.googleMaps
    };
}

Attraction.prototype.show = function () {
    this.loadDetails();
    this.container.show();
};

Attraction.prototype.hide = function () {
    this.container.hide();
};

Attraction.prototype.isChecked = function () {
    let result = this.checkbox[0].checked;
    return result;
};

Attraction.prototype.loadDetails = function () {

    if (!this.loadedDetails) {
        // get more details!
        let detailRequest = { placeId: this.placeID };
        let self = this;
        placesService.getDetails(detailRequest, function (placeDetail, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                console.log(placeDetail);

                self.address = placeDetail.formatted_address;
                self.phone = placeDetail.formatted_phone_number;
                self.website = placeDetail.website;
                self.googleMaps = placeDetail.url;

                self.checkbox.attr("data-addr", self.address);
                self.checkbox.attr("data-phone", self.phone);
                self.checkbox.attr("data-website", self.website);
                self.checkbox.attr("data-map-url", self.googleMaps);

                self.container.append(`<p>${self.address}</p>`);
                if (self.phone) {
                    self.container.append(`<p>${self.phone}</p>`);
                }
                if (self.website) {
                    let p = $("<p>");
                    let link = $("<a>");
                    link.attr("href", self.website);
                    link.attr("title", self.website);
                    link.attr("target", "_blank");
                    link.text(self.website);
                    self.container.append(p.append(link));
                }

                let p = $("<p>");
                let link = $("<a>");
                link.attr("href", self.googleMaps);
                link.attr("title", self.googleMaps);
                link.attr("target", "_blank");
                link.text("See in Google Maps");
                self.container.append(p.append(link));
                // succeeded
                self.loadedDetails = true;
            }
            else {
                // didn't succeed, but we can try again in the future on a 
                // subsequent show since we didn't set loadedDetails to true here
                console.log(status);
            }
        });
    }
};



let itineraryContainer = $("#itineraryContainer");
function Waypoint(address, latlng) {
    this.address = address;
    this.latlng = latlng;
    this.showingAttractions = false;

    // Create waypoint html
    this.fieldSetNode = $('<fieldset>');
    this.legendNode = $(`<legend 
                            data-address="${this.address}" 
                            data-lat="${this.latlng.lat}" 
                            data-lng="${this.latlng.lng}">
                            ${this.address}</legend>`);
    this.fieldSetNode.append(this.legendNode);
    itineraryContainer.prepend(this.fieldSetNode);

    // handle the situation where we have a waypoints lat/lng, but no address
    let self = this;
    if (!address) {
        geocoder.geocode({ 'location': this.latlng }, function (results, status) {
            if (status == 'OK') {
                let bestAddressIndex = ((results.length) ? 1 : 0);

                for (let j = 0; j < results.length; j++) {
                    if (results[j].types.indexOf("locality") != -1) {
                        bestAddressIndex = j;
                        break;
                    }
                }
                self.address = results[bestAddressIndex].formatted_address;
                self.legendNode.text(self.address);
                self.legendNode.attr("data-address", self.address);
            } else {
                console.log('Geocode was not successful for the following reason: ' + status);
            }

        });
    }

    // get nearby attractions
    // get attractions for waypoint
    this.request = { location: latlng, radius: '15000', query: 'attractions' };
    this.attractions = [];

    placesService.textSearch(this.request, function (results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {

            let numAttractions = (results.length < attractionsLimit ?
                results.length : attractionsLimit);

            for (let j = 0; j < numAttractions; j++) {
                self.attractions.push(new Attraction(results[j].name,
                    results[j].place_id,
                    self.fieldSetNode));
            }
        }
    });

    this.handleToggleAttractionsDisplay();
}

Waypoint.prototype.firebaseObject = function () {
    return {
        address: this.address,
        latlng: this.latlng
    };
}

Waypoint.prototype.handleToggleAttractionsDisplay = function () {
    let self = this;

    this.legendNode.click(function () {
        for (let i = 0; i < self.attractions.length; i++) {
            if (self.showingAttractions) { // hide them
                self.attractions[i].hide();
            }
            else { // show them
                self.attractions[i].show();
            }
        }
        self.showingAttractions = !self.showingAttractions;
    });

};



let localWaypointObjects = [];
// called by google maps api
function initialize() {
    geocoder = new google.maps.Geocoder();
    placesService = new google.maps.places.PlacesService($("<div>").get(0));

    // we should have an itinerary key and we can pull the city data
    // from firebase else epic fail
    if (firebaseItineraryKey) {
        $("#itineraryKey").val(firebaseItineraryKey);
        database.ref(itineraryPath).child(firebaseItineraryKey).once('value').then(function (snapshot) {
            console.log(snapshot.val());
            dbSnapshot = snapshot.val();

            for (let i = dbSnapshot.waypoints.length - 1; i >= 0; i--) {
                localWaypointObjects.push(new Waypoint(dbSnapshot.waypoints[i].address,
                    dbSnapshot.waypoints[i].latlng));
            }
        });

        listenForFormSubmit();
    }
    else {
        console.log("Return to original page, no key found.");
        returnToMainPageWithError("noKey");
    }

} // called by google maps api


// listen for form submit on itineraryContainer
function listenForFormSubmit() {

    // $("#itineraryContainer").on("submit", function (event) {
    itineraryContainer.on("submit", function (event) {
        itineraryContainer.off();
        event.preventDefault();
        $("#itineraryKey").val(firebaseItineraryKey);

        // update the waypoints since we may have geocoded addresses
        // send firebase the checked attractions
        let updatedWaypointsToSave = [];
        let arrayOfWaypointAttractions = [];

        for (let i = localWaypointObjects.length - 1; i >= 0; i--) {
            updatedWaypointsToSave.push(localWaypointObjects[i].firebaseObject());
            // create an array to hold waypoint attractions, first element is the waypoint so
            // there is no null arrays 
            // then we can assume waypoint arrays and attraction arrays line up
            let waypointsAttractions = [{
                name: localWaypointObjects[i].address,
                googlePlaceID: "",
                address: localWaypointObjects[i].address,
                phone: "",
                website: "",
                googleMapsURL: ""
            }];
            for (let j = 0; j < localWaypointObjects[i].attractions.length; j++) {
                if (localWaypointObjects[i].attractions[j].isChecked()) {
                    let a = localWaypointObjects[i].attractions[j].firebaseObject();
                    waypointsAttractions.push(a);
                }
            }
            arrayOfWaypointAttractions.push(waypointsAttractions);
        }

        // set up a new submit listener to trigger when the database saves are done
        itineraryContainer.on("submit", function () { /* do nothing, work is done */ });

        // save to firebase
        database.ref(itineraryPath).child(firebaseItineraryKey).update({
            waypoints: updatedWaypointsToSave
        });
        database.ref(itineraryPath).child(firebaseItineraryKey).update({
            attractions: arrayOfWaypointAttractions
        }, function (error) {
            if (error) {
                console.log("Data could not be saved." + error);
            } else {
                console.log("Data saved successfully.");
                itineraryContainer.trigger('submit');
            }
        });

    });
}