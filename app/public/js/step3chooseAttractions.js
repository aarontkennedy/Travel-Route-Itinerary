let geocoder = null;
let googlePlacesService = null;

let waypointFieldsets = $("fieldset.waypoint");
let localWaypointObjects = [];
const maxAttractions = 5;
const maxMetersSearchRange = 15000;

$(document).ready(function () {

    function Attraction() {
        this.container = null;
        this.checkbox = null;
    }
    Attraction.prototype.show = function () {
        this.container.show();
    }
    Attraction.prototype.hide = function () {
        this.container.hide();
    };
    Attraction.prototype.isChecked = function () {
        let result = this.checkbox[0].checked;
        return result;
    };

    function ZomatoRestaurant(restaurantInfo, parentNode) {
        //console.log(restaurantInfo);
        this.placeID = restaurantInfo.R.res_id;
        this.name = restaurantInfo.name;
        this.parentNode = parentNode;
        this.address = restaurantInfo.location.address;
        this.description = restaurantInfo.cuisines;
        this.website = restaurantInfo.url;

        // print what we know now
        this.container = $(`<div class="attraction zomatoRestaurant"/>`);
        this.label = $(`<label for="${this.placeID}">${this.name} (${this.description})</label>`);
        this.checkbox = $(`<input type="checkbox" value="${this.name}" 
            id="${this.placeID}"></input>`);
        this.details = `
        <p><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.address)}" target="_blank">${this.address}</a></p>
        <p><a href="${this.website}" target="_blank">See more at Zomato</a></p>`;

        this.label.prepend(this.checkbox);
        this.container.append(this.label);
        this.container.append(this.details);
        this.parentNode.append(this.container);

        this.container.hide();
    }

    ZomatoRestaurant.prototype = new Attraction();

    function GoogleAttraction(name, placeID, parentNode) {
        this.name = name;
        this.placeID = placeID;
        this.parentNode = parentNode;
        this.loadedDetails = false;
        this.address = "";
        this.phone = "";
        this.website = "";
        this.googleMaps = "";

        // print what we know now
        this.container = $(`<div class="attraction googleAttraction"/>`);
        this.label = $(`<label for="${this.placeID}">${this.name}</label>`);
        this.checkbox = $(`<input type="checkbox" value="${this.name}" 
            id="${this.placeID}"></input>`);

        this.label.prepend(this.checkbox);
        this.container.append(this.label);
        this.parentNode.append(this.container);

        this.container.hide();
    }

    GoogleAttraction.prototype = new Attraction();

    GoogleAttraction.prototype.show = function () {
        this.loadDetails();
        this.container.show();
    };

    GoogleAttraction.prototype.loadDetails = function () {

        if (!this.loadedDetails) {
            // get more details!
            let detailRequest = { placeId: this.placeID };
            let self = this;
            googlePlacesService.getDetails(detailRequest, function (placeDetail, status) {
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    //console.log(placeDetail);

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
                        let p = $("<p></p>");
                        let link = $("<a></a>");
                        link.attr("href", self.website);
                        link.attr("title", self.website);
                        link.attr("target", "_blank");
                        link.text(self.website);
                        self.container.append(p.append(link));
                    }

                    let p = $("<p></p>");
                    let link = $("<a></a>");
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


    function Waypoint(fieldsetElementWithData) {
        this.element = $(fieldsetElementWithData);
        this.address = this.element.attr("data-address");
        this.latlng = {
            lat: parseFloat(this.element.attr("data-lat")),
            lng: parseFloat(this.element.attr("data-lng"))
        };

        // Create waypoint html
        this.waypointTitle = $(`<h5 class="waypointAddressTitle"
                            data-address="${this.address}" 
                            data-lat="${this.latlng.lat}" 
                            data-lng="${this.latlng.lng}">
                            ${this.address}</h5>`);
        this.element.prepend(this.waypointTitle);

        this.googleAttractionsDiv = $("<div></div>");
        this.element.append(this.googleAttractionsDiv);
        this.zomatosRestaurantDiv = $("<div></div>");
        this.element.append(this.zomatosRestaurantDiv);

        this.showingGoogleAttractions = false;
        this.showingZomatosRestaurant = false;

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
                    self.waypointTitle.text(self.address);
                    self.waypointTitle.attr("data-address", self.address);
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
        const request = { location: this.latlng, radius: maxMetersSearchRange, query: 'attractions' };
        this.googleAttractions = [];

        let self = this;
        googlePlacesService.textSearch(request, function (results, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {

                let numAttractions = (results.length < maxAttractions ?
                    results.length : maxAttractions);

                for (let i = 0; i < numAttractions; i++) {
                    self.googleAttractions.push(new GoogleAttraction(results[i].name,
                        results[i].place_id,
                        self.googleAttractionsDiv));
                }
            }
        });

        this.handleToggleAttractionsDisplay();
    };

    Waypoint.prototype.findZomatoRestaurants = function () {
        const key = "ae21a911a514879c58c573069500f916";
        let url = `https://developers.zomato.com/api/v2.1/search?count=${maxAttractions}&lat=${this.latlng.lat}&lon=${this.latlng.lng}&radius=${maxMetersSearchRange}0&sort=rating`;
        this.zomatoRestaurants = [];

        let self = this;
        $.ajax({
            type: 'GET',
            url: url,
            beforeSend: function (request) {
                request.setRequestHeader("user-key", key);
            },
        }).done(function (data) {
            //console.log(data);
            for (let i = 0; i < data.results_shown; i++) {
                self.zomatoRestaurants.push(new ZomatoRestaurant(data.restaurants[i].restaurant, self.zomatosRestaurantDiv));
            }
            console.log(self.address);
            console.log(self.zomatoRestaurants);
        });
    };

    Waypoint.prototype.showGoogleAttractions = function () {
        for (let i = 0; i < this.googleAttractions.length; i++) {
            this.googleAttractions[i].show();
        }
        this.showingGoogleAttractions = true;
    };

    Waypoint.prototype.showZomatoRestaurants = function () {
        for (let i = 0; i < this.zomatoRestaurants.length; i++) {
            this.zomatoRestaurants[i].show();
        }
        this.showingZomatoRestaurants = true;
    };

    Waypoint.prototype.hideGoogleAttractions = function () {
        for (let i = 0; i < this.googleAttractions.length; i++) {
            this.googleAttractions[i].hide();
        }
        this.showingGoogleAttractions = false;
    };

    Waypoint.prototype.hideZomatoRestaurants = function () {
        for (let i = 0; i < this.zomatoRestaurants.length; i++) {
            this.zomatoRestaurants[i].hide();
        }
        this.showingZomatoRestaurants = false;
    };

    Waypoint.prototype.toggleGoogleAttractions = function () {
        if (this.showingGoogleAttractions) {
            this.showingGoogleAttractions = false;
            this.hideGoogleAttractions();
        }
        else {
            this.showingGoogleAttractions = true;
            this.showGoogleAttractions();
        }
    };

    Waypoint.prototype.toggleZomatoRestaurants = function () {
        if (this.showingZomatoRestaurants) {
            this.showingZomatoRestaurants = false;
            this.hideZomatoRestaurants();
        }
        else {
            this.showingZomatoRestaurants = true;
            this.showZomatoRestaurants();
        }
    };

    Waypoint.prototype.handleToggleAttractionsDisplay = function () {
        let self = this;

        this.element.on("click", ".tab", function () {

            if ($(this).hasClass("googleAttraction")) {
                if (self.showingZomatoRestaurants) {
                    self.hideZomatoRestaurants();
                    self.showGoogleAttractions();
                }
                else {
                    self.toggleGoogleAttractions();
                }
            }
            else {  // hasClass("zomatoRestaurant")
                if (self.showingGoogleAttractions) {
                    self.hideGoogleAttractions();
                    self.showZomatoRestaurants();
                }
                else {
                    self.toggleZomatoRestaurants();
                }
            }
        });
    };

    function initialize() {
        geocoder = new google.maps.Geocoder();
        googlePlacesService = new google.maps.places.PlacesService($("<div></div>").get(0));

        for (let i = 0; i < waypointFieldsets.length; i++) {
            localWaypointObjects.push(new Waypoint(waypointFieldsets[i]));
        }
    }
    initialize();

});