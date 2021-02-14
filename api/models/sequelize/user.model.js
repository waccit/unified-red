const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    let model = sequelize.define('User', {
        _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV1, allowNull: false, primaryKey: true },
        username: { type: DataTypes.STRING, unique: true, required: true },
        hash: { type: DataTypes.STRING, required: true },
        role: { type: DataTypes.INTEGER, required: true },
        firstName: { type: DataTypes.STRING, required: true },
        lastName: { type: DataTypes.STRING, required: true },
        email: { type: DataTypes.STRING, required: true },
        enabled: { type: DataTypes.BOOLEAN, defaultValue: true, required: true },
        createdAt: { field: 'createdDate', type: DataTypes.DATE },
        expirationDate: { type: DataTypes.DATE },
        resetToken: { type: DataTypes.STRING },
        sessionExpiration: { type: DataTypes.INTEGER },
        sessionInactivity: { type: DataTypes.INTEGER },
        homepage: { type: DataTypes.STRING },
    });

    model.prototype.toJSON = function () {
        let values = { ... this.dataValues };
        delete values.hash;
        delete values.resetToken;
        return values;
    };

    return model;
};