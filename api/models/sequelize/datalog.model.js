const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    let model = sequelize.define('Datalog', {
        _id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
        createdAt: { field: 'timestamp', type: DataTypes.DATE },
        logger: { field: 'LoggerId', type: DataTypes.INTEGER, foreignKey: true },
        value: { type: DataTypes.JSON, required: true },
        status: { type: DataTypes.STRING },
        expires: { type: DataTypes.DATE, required: true },
    }, {
        updatedAt: false
    });

    model.prototype.toJSON = function () {
        let values = { ... this.dataValues };
        delete values.expires;
        return values;
    };

    return model;
};

//schema.index({ expires: 1 }, { expireAfterSeconds: 0 }); // TODO: auto expire on sequelize?
