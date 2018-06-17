module.exports = function (app) {

    app.get("/api/burgerseaten/:eater_id", function (req, res) {
        if (!req.params.eater_id) {
            return res.sendStatus(400);
        }

        orm.getBurgersEaten(req.params.eater_id,
            function (error, result) {
                if (error) {
                    console.log(error);
                    return res.sendStatus(500);
                }
                //console.log(result);
                return res.json(result);
            });
    });

};