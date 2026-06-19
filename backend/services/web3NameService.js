const userService = require("./userService");

const NAME_MINT_PRICE = Number(process.env.WEB3_NAME_PRICE || 500);
const NAME_SUFFIX = "livestreamlab";

const names = new Map();
const namesByUser = new Map();
const userBalances = new Map();

const reserved = new Set(["admin", "root", "support", "system", "livestreamlab"]);

function normalizeName(name) {
  return String(name || "").trim().toLowerCase();
}

function isValidName(name) {
  return /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/.test(name);
}

function ensureBalance(userId) {
  if (!userBalances.has(userId)) {
    userBalances.set(userId, 2500);
  }

  return userBalances.get(userId);
}

function profileFromRecord(record) {
  return {
    name: record.name,
    domain: `${record.name}.${NAME_SUFFIX}`,
    identity: `${record.name}@${NAME_SUFFIX}`,
    ownerUserId: record.ownerUserId,
    walletAddress: record.walletAddress,
    role: record.role,
    purchasedAt: record.purchasedAt,
  };
}

async function checkAvailability(rawName) {
  const name = normalizeName(rawName);

  if (!name) {
    return { available: false, reason: "NAME_REQUIRED" };
  }

  if (!isValidName(name)) {
    return { available: false, reason: "INVALID_NAME" };
  }

  if (reserved.has(name)) {
    return { available: false, reason: "RESERVED" };
  }

  if (names.has(name)) {
    return { available: false, reason: "TAKEN" };
  }

  return { available: true, reason: "AVAILABLE" };
}

async function purchaseName({ user, rawName }) {
  if (!user) {
    return { status: "UNAUTHORIZED" };
  }

  const name = normalizeName(rawName);
  const availability = await checkAvailability(name);
  if (!availability.available) {
    return { status: availability.reason };
  }

  const currentBalance = ensureBalance(user.userId);
  if (currentBalance < NAME_MINT_PRICE) {
    return {
      status: "INSUFFICIENT_BALANCE",
      price: NAME_MINT_PRICE,
      balance: currentBalance,
    };
  }

  const existingName = namesByUser.get(user.userId);
  if (existingName) {
    return {
      status: "ALREADY_OWNS_NAME",
      ownedName: existingName,
      profileUrl: `/u/${existingName}`,
      identity: `${existingName}@${NAME_SUFFIX}`,
    };
  }

  const record = {
    name,
    ownerUserId: user.userId,
    walletAddress: user.provider === "phantom" ? user.providerId : null,
    role: user.role,
    purchasedAt: new Date().toISOString(),
  };

  names.set(name, record);
  namesByUser.set(user.userId, name);
  userBalances.set(user.userId, currentBalance - NAME_MINT_PRICE);

  await userService.bindNameToUser(user.userId, name);

  return {
    status: "PURCHASED",
    price: NAME_MINT_PRICE,
    balance: userBalances.get(user.userId),
    profileUrl: `/u/${name}`,
    identity: `${name}@${NAME_SUFFIX}`,
    domain: `${name}.${NAME_SUFFIX}`,
  };
}

async function getPublicProfile(rawName) {
  const name = normalizeName(rawName);
  const record = names.get(name);
  if (!record) return null;

  return profileFromRecord(record);
}

async function getMyName(user) {
  if (!user) return null;

  const name = namesByUser.get(user.userId);
  const balance = ensureBalance(user.userId);
  if (!name) {
    return {
      hasName: false,
      balance,
      price: NAME_MINT_PRICE,
    };
  }

  const record = names.get(name);
  return {
    hasName: true,
    balance,
    price: NAME_MINT_PRICE,
    ...profileFromRecord(record),
    profileUrl: `/u/${name}`,
  };
}

module.exports = {
  NAME_MINT_PRICE,
  checkAvailability,
  purchaseName,
  getPublicProfile,
  getMyName,
};
