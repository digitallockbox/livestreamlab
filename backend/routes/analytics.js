const analyticsController = require("../controllers/analyticsController");

module.exports = [
	{ method: "GET", path: "/analytics/overview", handler: analyticsController.getOverview, roles: ["admin"] },
	{ method: "GET", path: "/analytics/streamAnalytics", handler: analyticsController.getStreamAnalytics, roles: ["admin"] },
	{ method: "GET", path: "/analytics/contentAnalytics", handler: analyticsController.getContentAnalytics, roles: ["admin"] },
];
