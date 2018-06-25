$(document).ready(function () {
    // Code for Step 1 page - get starting and ending locations
    // this code obviously initializes the auto complete for the address input
    function initializeAddressAutocomplete() {
        $(".geocomplete").geocomplete();
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