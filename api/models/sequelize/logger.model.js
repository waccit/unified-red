const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    let model = sequelize.define('Logger', {
        _id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
        topic: { type: DataTypes.STRING, unique: true, required: true},
        units: { type: DataTypes.STRING },
        tags: { type: DataTypes.JSON },
        maxDays: { type: DataTypes.INTEGER, required: true },
    }, {
        indexes: [
            { unique: true, fields: ['topic'] }
        ]
    });

    return model;
};