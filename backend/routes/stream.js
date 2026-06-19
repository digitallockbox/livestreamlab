const streamController = require("../controllers/streamController");

module.exports = [
	{ method: "GET", path: "/stream/status", handler: streamController.getStreamStatus },
	{ method: "POST", path: "/stream/start", handler: streamController.startStream },
	{ method: "POST", path: "/stream/stop", handler: streamController.stopStream },
];
