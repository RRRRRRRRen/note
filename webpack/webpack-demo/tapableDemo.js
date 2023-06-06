const SyncHook = require("./node_modules/tapable/lib/SyncHook");

const syncHook = new SyncHook(["arg1", "arg2", "arg3"]);

syncHook.tap("1", (arg1, arg2, arg3) => {
  console.log("1", arg1, arg2, arg3);
});

syncHook.tap("2", (arg1, arg2, arg3) => {
  console.log("2", arg1, arg2, arg3);
});

syncHook.call("arg1", "arg2", "arg3");
