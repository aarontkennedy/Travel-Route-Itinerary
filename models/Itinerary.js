module.exports = function (sequelize, DataTypes) {

    let Itinerary = sequelize.define("Itinerary", {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        waypointsJSON: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        attractionsJSON: {
            type: DataTypes.TEXT
        }
    });
    // don't need to add anything, this is just a target for waypoints
    // on a particular itinerary

    Itinerary.associate = function (models) {
        Itinerary.belongsTo(models.User, {
            foreignKey: {
                allowNull: false
            }
        });
    };

    return Itinerary;
};