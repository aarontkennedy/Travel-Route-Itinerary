
// Initialize Firebase
var config = {
    apiKey: "AIzaSyBhlawP2CJCdBGTT9v3AFJXSd1WuDRuFkE",
    authDomain: "mysandbox-d3105.firebaseapp.com",
    databaseURL: "https://mysandbox-d3105.firebaseio.com",
    projectId: "mysandbox-d3105",
    storageBucket: "mysandbox-d3105.appspot.com",
    messagingSenderId: "701778948919"
};
firebase.initializeApp(config);
// Create a variable to reference the database.
let database = firebase.database();
let databasePath = "roadRover"
let itineraryPath = databasePath + "/itinerary";

// http://www.jquerybyexample.net/2012/06/get-url-parameters-using-jquery.html
function GetURLParameter(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
}


