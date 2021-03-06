const _000_001 = require("./000-001");
const _001_002 = require("./001-002");
const _002_003 = require("./002-003");

const migrators = {
  "0.0.0": _000_001,
  "0.0.1": _001_002,
  "0.0.2": _002_003
};

module.exports = (oldModule) => {
  const migrate = migrators[oldModule.version || "0.0.0"];
  return migrate ? module.exports(migrate(oldModule)) : oldModule;
};
