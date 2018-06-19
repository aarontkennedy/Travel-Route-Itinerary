module.exports = function (sequelize, DataTypes) {
    
    let User = sequelize.define("User", {
        googleID: { type: DataTypes.STRING, 
                    allowNull: false, 
                    primaryKey: true },
        name: { type: DataTypes.STRING, 
                allowNull: false },
        displayName: { type: DataTypes.STRING, 
                       allowNull: false }
    });

    return User;
};