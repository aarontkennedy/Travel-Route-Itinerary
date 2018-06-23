module.exports = function (app) {

    // 1. user first goes to the homepage where they signin
    app.get("/", function (req, res) {
        res.render("index", { signedIn: false });
    });

    // 2. once the user is logged in, they can choose the
    // starting and ending destinations for their trip
    app.get("/chooseEndpoints/:userID", function (req, res) {
        res.render("chooseEndpoints", {
            userID: req.params.userID,
            signedIn: true
        });
    });

    // 3. here they get the optimal route displayed and they
    // can pick waypoints to stop off at
    app.post("/routeAndWaypoints/:userID", function (req, res) {
        if (!req.body.start || !req.body.destination) {
            return req.status(400).send("Start and destinations must be given.");
        }
        
        res.render("routeAndWaypoints", {
            userID: req.params.userID,
            startingAddress: req.body.start,
            endingAddress: req.body.destination,
            signedIn: true
        });
    });

    // 4. Now they are presented with attractions to choose from
    // at the waypoints they chose...
    app.post("/chooseAttractions/:userID", function (req, res) { 
        console.log(req.body);       
        res.render("chooseAttractions", {
            userID: req.params.userID,
            startingAddress: req.body.start,
            endingAddress: req.body.destination,
            signedIn: true
        });
    });

};