
const allCapabilities = {
    showQr: 'showQr',
    listtUsers: 'getUsers',
    manageUsers: 'manageUsers',
};

const allRoles = {
    user: [],
    fieldWorker: [allCapabilities.showQr],
    manager: [allCapabilities.listtUsers],
    admin: [allCapabilities.listtUsers, allCapabilities.manageUsers],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
    roles,
    roleRights,
    allRoles,
    allCapabilities,
};
