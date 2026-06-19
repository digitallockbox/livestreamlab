const web3Controller = require("../controllers/web3Controller");

module.exports = [
  { method: "GET", path: "/web3/name/check", handler: web3Controller.checkName },
  { method: "POST", path: "/web3/name/purchase", handler: web3Controller.purchaseName, roles: ["admin", "creator"] },
  { method: "GET", path: "/web3/name/my", handler: web3Controller.getMyName, roles: ["admin", "creator"] },
  { method: "GET", path: "/web3/name/profile/:name", handler: web3Controller.getProfile },
];
