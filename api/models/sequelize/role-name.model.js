const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    let model = sequelize.define('Role', {
        _id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
        level: { type: DataTypes.INTEGER, unique: true, required: true },
        name: { type: DataTypes.STRING, unique: true, required: true },
    });

    return model;
};