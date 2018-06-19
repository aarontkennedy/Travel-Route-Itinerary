module.exports = function (sequelize, DataTypes) {

    let Itinerary = sequelize.define("Itinerary", {});
    // don't need to add anything, this is just a target for waypoints
    // on a particular itinerary

    Itinerary.associate = function (models) {
        Itinerary.belongsTo(models.User);
    };

    return Itinerary;
};