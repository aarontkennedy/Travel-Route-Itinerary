module.exports = function (sequelize, DataTypes) {

    let User = sequelize.define("User", {
        googleID: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });


    User.associate = function (models) {
        User.hasMany(models.Itinerary, {
            onDelete: "cascade"
        });
    };

    return User;
};