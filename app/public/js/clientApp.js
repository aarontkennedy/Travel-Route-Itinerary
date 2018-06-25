


// Step 3: Choose Attactions!
let waypointFieldsets = $("fieldset.waypoint");
let localWaypointObjects = [];
for (let i = 0; i < waypointFieldsets.length; i++) {
    localWaypointObjects.push(new Waypoint(waypointFieldsets[i]));
}

function Waypoint(fieldsetElementWithData) {
    this.element = $(fieldsetElementWithData);
    this.address = this.element.attr("data-address");
    this.latlng = {
        lat: this.element.attr("data-lat"),
        lng: this.element.attr("data-lng")
    };
    //this.showingAttractions = false;

    // Create waypoint html
    this.legendNode = $(`<legend 
                            data-address="${this.address}" 
                            data-lat="${this.latlng.lat}" 
                            data-lng="${this.latlng.lng}">
                            ${this.address}</legend>`);
    this.element.append(this.legendNode);

    // handle the situation where we have a waypoints lat/lng, but no address
    let self = this;
    if (!this.address) {
        initGeocoder();
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
}
/*
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


// called by google maps api
function initialize() {
    geocoder = new google.maps.Geocoder();
    placesService = new google.maps.places.PlacesService($("<div>").get(0));

} // called by google maps api

*/

