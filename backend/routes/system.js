const systemController = require("../controllers/systemController");

module.exports = [
	{ method: "GET", path: "/system/health", handler: systemController.getHealth, roles: ["admin"] },
	{ method: "GET", path: "/system/enginesHealth", handler: systemController.getEnginesHealth, roles: ["admin"] },
];
