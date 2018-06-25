module.exports = function (app) {

    // 1. user first goes to the homepage where they signin
    app.get("/", function (req, res) {
        res.render("index", { signedIn: false,
                              scriptName: ""});
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
            return req.status(400).send("Start and destinations must be given.");
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
        console.log(req.body);

        let startLatLng = JSON.parse(req.body.startingAddressLatLng);
        let endLatLng = JSON.parse(req.body.endingAddressLatLng);
        let waypoints = JSON.parse(req.body.waypointsChosen);
        console.log(waypoints);

        res.render(filename, {
            userID: req.params.userID,
            startingAddress: req.body.startingAddress,
            endingAddress: req.body.endingAddress,
            startingAddressLatLng: startLatLng,
            endingAddressLatLng: endLatLng,
            waypoints: waypoints,
            signedIn: true,
            scriptName: filename
        });
    });

};