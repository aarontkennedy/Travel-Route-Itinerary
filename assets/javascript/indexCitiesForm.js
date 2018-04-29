$(document).ready(function () {

    function initializeAddressAutocomplete() {
        $(".geocomplete").geocomplete();
        /*
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
            else { // form input is valid
                let startingPoint = $("#startingLocation").val().trim();
                let destination = $("#finalDestination").val().trim();

                // make a key for the itinerary
                let itineraryKey = database.ref(itineraryPath).push().key;

                // create your user
                database.ref(itineraryPath).child(itineraryKey).update({
                    key: itineraryKey,
                    owner: "",
                    start: startingPoint,
                    startLatLng: "",
                    end: destination,
                    endLatLng: "",
                    waypoints: ""
                });

                // append itinerary key to the get action
                $("#itineraryKey").val(itineraryKey);
            }
        });
    }
    setUpListenForFormSubmission();


});


