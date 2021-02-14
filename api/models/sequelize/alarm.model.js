const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    let model = sequelize.define('Alarm', {
        _id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
        severity: { type: DataTypes.STRING, required: true },
        name: { type: DataTypes.STRING, required: true },
        topic: { type: DataTypes.STRING, required: true },
        value: { type: DataTypes.STRING, required: true },
        state: { type: DataTypes.BOOLEAN, required: true },
        acktime: { type: DataTypes.DATE },
        ackreq: { type: DataTypes.BOOLEAN },
        createdAt: { field: 'timestamp', type: DataTypes.DATE },
    });

    return model;
};
