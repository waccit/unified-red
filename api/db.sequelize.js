const { Sequelize, Op } = require('sequelize');

const operatorsAliases = {
    $eq: Op.eq,
    $ne: Op.ne,
    $gte: Op.gte,
    $gt: Op.gt,
    $lte: Op.lte,
    $lt: Op.lt,
    $not: Op.not,
    $in: Op.in,
    $notIn: Op.notIn,
    $nin: Op.notIn,
    $is: Op.is,
    $like: Op.like,
    $notLike: Op.notLike,
    $iLike: Op.iLike,
    $notILike: Op.notILike,
    $regexp: Op.regexp,
    $notRegexp: Op.notRegexp,
    $iRegexp: Op.iRegexp,
    $notIRegexp: Op.notIRegexp,
    $between: Op.between,
    $notBetween: Op.notBetween,
    $overlap: Op.overlap,
    $contains: Op.contains,
    $contained: Op.contained,
    $adjacent: Op.adjacent,
    $strictLeft: Op.strictLeft,
    $strictRight: Op.strictRight,
    $noExtendRight: Op.noExtendRight,
    $noExtendLeft: Op.noExtendLeft,
    $and: Op.and,
    $or: Op.or,
    $any: Op.any,
    $all: Op.all,
    $values: Op.values,
    $col: Op.col,
};

async function testConnection(conn) {
    try {
        await new Sequelize(conn).authenticate();
        return true;
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
    return false;
}

module.exports = {
    testConnection,
    connect: function(dbConnection) {
        let sequelizeStatus = 'disconnected';

        //'sqlite:unified-red.db'
        //'mysql://user:pass@localhost:3306/unified-red'
        //'postgres://user:pass@localhost:5432/unified-red'
        //'mssql://user:pass@localhost:1433/unified-red'
        const sequelize = new Sequelize(dbConnection, {
            operatorsAliases,
            logging: false, //console.log,
        });

        // sequelize.beforeBulkSync((name) => {});
        // sequelize.afterBulkSync(() => {});

        // Models
        const modelDefiners = [
            require('./models/sequelize/user.model'),
            require('./models/sequelize/role-name.model'),
            require('./models/sequelize/alarm.model'),
            require('./models/sequelize/logger.model'),
            require('./models/sequelize/datalog.model'),
        ];
        for (const modelDefiner of modelDefiners) {
            modelDefiner(sequelize);
        }

        function status() {
            return sequelizeStatus;
        }

        (async () => {
            // setup associations/lookup models
            sequelize.models.Logger.hasMany(sequelize.models.Datalog);
            sequelize.models.Datalog.belongsTo(sequelize.models.Logger);

            sequelize.authenticate()
                .then(() => { sequelizeStatus = 'connected'; })
                .catch(err => { 
                    sequelizeStatus = 'disconnected';
                    console.error(err);
                });

            // automatically setup tables
            await sequelize.sync({ hooks: true });
        })();

        function mongoDbAdapter(criteria, projection, options) {
            let query = {};
            if (criteria) {
                query.where = criteria;
            }
            if (projection) {
                query.attributes = typeof projection === 'string' ? projection.split(/\s+/) : projection;
            }
            if (options) {
                if (options.sort) {
                    query.order = [];
                    for (let key in options.sort) {
                        query.order.push([key, options.sort === -1 ? 'DESC' : 'ASC' ]);
                    }
                }
                if (options.limit) {
                    query.limit = options.limit;
                }
                if (options.include) {
                    query.include = options.include;
                }
                if (options.raw) {
                    query.raw = options.raw;
                }
            }
            return query;
        };

        return {
            type: 'sql',
            status,
            testConnection,
            User: sequelize.models.User,
            Role: sequelize.models.Role,
            Alarm: sequelize.models.Alarm,
            Logger: sequelize.models.Logger,
            Datalog: sequelize.models.Datalog,
            count: (table) => table.count(),
            create: (table, data, options) => table.create(data, mongoDbAdapter(null, null, options)),
            deleteMany: (table, criteria, projection, options) => table.destroy(mongoDbAdapter(criteria, projection, options)),
            distinct: async (table, column) => (await table.aggregate(column, 'DISTINCT', { plain: false })).map(row => row.DISTINCT),
            join: (table, model, criteria, projection, options) => {
                if (!options) {
                    options = {};
                }
                if (!options.hasOwnProperty('include')) {
                    options.include = { model: sequelize.models[model], attributes: [] };
                }
                if (!options.hasOwnProperty('raw')) {
                    options.raw = true;
                }
                return table.findAll(mongoDbAdapter(criteria, projection, options));
            },
            find: (table, criteria, projection, options) => table.findAll(mongoDbAdapter(criteria, projection, options)),
            findById: (table, pk, projection, options) => table.findByPk(pk, mongoDbAdapter(null, projection, options)),
            findByIdAndRemove: async (table, pk, projection, options) => {
                let result = await table.findByPk(pk, mongoDbAdapter(null, projection, options));
                result.destroy();
                return result;
            },
            findOne: (table, criteria, projection, options) => table.findOne(mongoDbAdapter(criteria, projection, options)),
            findOneAndDelete: async (table, criteria, projection, options) => {
                let result = await table.findOne(mongoDbAdapter(criteria, projection, options));
                result.destroy();
                return result;
            },
            update: (table, criteria, data, options) => table.update(data, mongoDbAdapter(criteria, null, options)),
        };
    }
}