const db = require('../db');
const Role = db.Role;

module.exports = {
    getAll,
    update,
};

async function init() {
    if (await Role.countDocuments() === 0) {
        let defaultRoles = [
            { level: 1, name: 'Viewer' },
            { level: 2, name: 'Limited Operator' },
            { level: 3, name: 'Standard Operator' },
            { level: 4, name: 'IT Operator' },
            { level: 5, name: 'Security Operator' },
            // { level: 6, name: 'Future / Reserved' },
            // { level: 7, name: 'Future / Reserved' },
            // { level: 8, name: 'Future / Reserved' },
            { level: 9, name: 'Tech' },
            { level: 10, name: 'Admin' },
        ];
        for (var roleParam of defaultRoles) {
            await new Role(roleParam).save();
        }
    }
}
init();

async function getAll() {
    return await Role.find();
}

async function update(level, roleParam) {
    const role = await Role.findOne({ level: level });
    if (!role) {
        throw 'Role not found';
    }
    if (role.name !== roleParam.name && (await Role.findOne({ name: roleParam.name }))) {
        throw 'Role "' + roleParam.name + '" is already taken';
    }
    role.name = roleParam.name;
    await role.save();
    return role;
}
