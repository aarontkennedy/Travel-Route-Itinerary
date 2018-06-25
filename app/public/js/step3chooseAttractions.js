let geocoder = null;
let googlePlacesService = null;

let waypointFieldsets = $("fieldset.waypoint");
let localWaypointObjects = [];
const maxAttractions = 5;

$(document).ready(function () {

    function Waypoint(fieldsetElementWithData) {
        this.element = $(fieldsetElementWithData);
        this.address = this.element.attr("data-address");
        this.latlng = {
            lat: parseFloat(this.element.attr("data-lat")),
            lng: parseFloat(this.element.attr("data-lng"))
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
        this.findGoogleAttractions();
        this.findZomatoRestaurants();
    }

    Waypoint.prototype.findGoogleAttractions = function () {
        // get nearby attractions
        // get attractions for waypoint
        const request = { location: this.latlng, radius: '15000', query: 'attractions' };
        this.googleAttractions = [];

        let self = this;
        googlePlacesService.textSearch(request, function (results, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {

                let numAttractions = (results.length < maxAttractions ?
                    results.length : maxAttractions);

                for (let i = 0; i < numAttractions; i++) {
                    self.element.append(`<p>${results[i].name}</p>`);
                    /*self.googleAttractions.push(new Attraction(results[i].name,
                        results[i].place_id,
                        self.fieldSetNode));*/
                }
            }
        });

        //this.handleToggleAttractionsDisplay();
    };

    Waypoint.prototype.findZomatoRestaurants = function () {
        const key = "ae21a911a514879c58c573069500f916";
        let url = `https://developers.zomato.com/api/v2.1/search?count=${maxAttractions}&lat=${this.latlng.lat}&lon=${this.latlng.lng}&radius=15000&sort=rating`;
        this.zomatoRestaurants = [];

        let self = this;
        $.ajax({
            type: 'GET',
            url: url,
            beforeSend: function (request) {
                request.setRequestHeader("user-key", key);
            },
        }).done(function (data) {
            console.log(data);
            for (let i = 0; i < data.results_shown-1; i++) {
                self.element.append(`<p>${data.restaurants[i].restaurant.name}</p>`);
                /*self.zomatoRestaurants.push(new Attraction(results[i].name,
                    results[i].place_id,
                    self.fieldSetNode));*/
            }
        });
    };
    

    /*
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
    
    };*/



    function initialize() {
        geocoder = new google.maps.Geocoder();
        googlePlacesService = new google.maps.places.PlacesService($("<div>").get(0));

        for (let i = 0; i < waypointFieldsets.length; i++) {
            localWaypointObjects.push(new Waypoint(waypointFieldsets[i]));
        }
    }
    initialize();

});