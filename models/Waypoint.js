module.exports = function (sequelize, DataTypes) {
    
    let Waypoint = sequelize.define("Waypoint", {
        // these may need to be temporarily null?
        // i don't always have both pieces of info at the same time
        address: { type: DataTypes.STRING },
        latitude: { type: DataTypes.FLOAT() },
        longitude: { type: DataTypes.FLOAT() }
    });

    Waypoint.associate = function (models) {
        Waypoint.belongsTo(models.Itinerary);
    };

    return Waypoint;
};