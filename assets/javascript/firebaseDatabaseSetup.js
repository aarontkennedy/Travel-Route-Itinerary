
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

//check the elements in the database

var ref = firebase.database(itineraryPath).ref();

ref.once("value").then(function (snap) {

 console.log('snap.val()', snap.val());

 });
