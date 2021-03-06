
//Creates the User Table

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('users', {
        userId:{
            type: DataTypes.STRING,
            allowNull: false,
            // userId will be the main identifier of Discord users
            primaryKey: true,
            validate: {
                notEmpty: true
            }
        },
        userName:{
            type: DataTypes.TEXT,
            allowNull: false,
        },
        banned:{
            type: DataTypes.BOOLEAN
        },

        // Note: User will have many Posts (set up in dbinit)
        // Note: User will have many Subscriptions (set up in dbinit)
    })
};