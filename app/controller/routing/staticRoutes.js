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
            signedIn: true,
            script: "chooseEndpoints"
        });
    });

    // 3. here they get the optimal route displayed and they
    // can pick waypoints to stop off at
    app.post("/routeAndWaypoints/:userID", function (req, res) {
        res.render("routeAndWaypoints", {
            userID: req.params.userID,
            signedIn: true,
            script: "routeAndWaypoints"
        });
    });

};