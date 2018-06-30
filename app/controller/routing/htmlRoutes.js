module.exports = function (app) {

    const db = require("../../../models/index.js");

    // 1. user first goes to the homepage where they signin
    app.get("/", function (req, res) {
        res.render("index", {
            signedIn: false,
            scriptName: ""
        });
    });

    // 2. once the user is logged in, they can choose the
    // starting and ending destinations for their trip
    app.get("/chooseEndpoints/:userID", function (req, res) {
        let filename = "step1chooseEndpoints";
        res.render(filename, {
            userID: req.params.userID,
            signedIn: true,
            scriptName: filename
        });
    });

    // 3. here they get the optimal route displayed and they
    // can pick waypoints to stop off at
    app.post("/routeAndWaypoints/:userID", function (req, res) {
        let filename = "step2routeAndWaypoints";
        if (!req.body.start || !req.body.destination) {
            return res.status(400).send("Start and destinations must be given.");
        }

        res.render(filename, {
            userID: req.params.userID,
            startingAddress: req.body.start,
            endingAddress: req.body.destination,
            signedIn: true,
            scriptName: filename
        });
    });

    // 4. Now they are presented with attractions to choose from
    // at the waypoints they chose...
    app.post("/chooseAttractions/:userID", function (req, res) {
        let filename = "step3chooseAttractions";
        if (!req.body.startingAddress ||
            !req.body.endingAddress ||
            !req.body.startingAddressLatLng ||
            !req.body.endingAddressLatLng ||
            !req.body.waypointsChosen) {
            return res.status(400).send("Waypoints must be given.");
        }

        let startLatLng = JSON.parse(req.body.startingAddressLatLng);
        let endLatLng = JSON.parse(req.body.endingAddressLatLng);
        let waypoints = JSON.parse(req.body.waypointsChosen);

        if (waypoints.length < 2) {
            return res.status(400).send("We should have at least 2 waypoints (start and end).");
        }

        // store the google information/user info here
        db.Itinerary.create({
            name: waypoints[0].address + " to " + waypoints[waypoints.length - 1].address,
            waypointsJSON: req.body.waypointsChosen,
            UserGoogleID: req.params.userID
        }).then(function (result) {
            res.render(filename, {
                userID: req.params.userID,
                itineraryID: result.dataValues.id,
                itineraryName: result.dataValues.name,
                startingAddress: req.body.startingAddress,
                endingAddress: req.body.endingAddress,
                startingAddressLatLng: startLatLng,
                endingAddressLatLng: endLatLng,
                waypoints: waypoints,
                signedIn: true,
                scriptName: filename
            });
        });

    });


    // 5. Save the attractions and return a pretty pdf
    app.post("/save/:userID/:itineraryID", function (req, res) {
        let filename = "step4save";

        //console.log(req.body);

        // store the google information/user info here
        db.Itinerary.update(
            { attractionsJSON: req.body.itinerary},
            { where: {id: req.params.itineraryID}}
        ).then(function (updateResult) {

            console.log(updateResult);

            res.render(filename, {
                userID: req.params.userID,
                itinerary: {
                    id: req.params.itineraryID,
                    name: req.body.itineraryName,
                    waypoints: JSON.parse(req.body.itinerary)
                },
                scriptName: filename,
                signedIn: true

            });

        });

    });

     // Retrieve the saved itinerary
     app.get("/:userID/:itineraryID", function (req, res) {
        let filename = "step4save";

        db.Itinerary.findOne(
            { where: {id: req.params.itineraryID}}
        ).then(function (itinerary) {

            console.log(itinerary);

            res.render(filename, {
                userID: req.params.userID,
                itinerary: {
                    id: req.params.itineraryID,
                    name: itinerary.dataValues.name,
                    waypoints: JSON.parse(itinerary.dataValues.attractionsJSON)
                },
                scriptName: filename,
                signedIn: true /* i don't know - are we? */
            });
        });

    });
};