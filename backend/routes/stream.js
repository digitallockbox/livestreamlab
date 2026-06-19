const streamController = require("../controllers/streamController");

module.exports = [
	{ method: "GET", path: "/stream/status", handler: streamController.getStreamStatus, roles: ["admin", "creator"] },
	{ method: "POST", path: "/stream/start", handler: streamController.startStream, roles: ["admin", "creator"] },
	{ method: "POST", path: "/stream/stop", handler: streamController.stopStream, roles: ["admin", "creator"] },
];
