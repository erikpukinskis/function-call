var functionCall = require("./")

var build = functionCall("buildTemple").withArgs({height: "30 cubits"})

console.log(build.evalable())

var moveIn = functionCall("moveIn").withArgs("Tuesday")

console.log(build.withArgs(moveIn).evalable())

var me = functionCall("me").singleton()
console.log(me.methodCall("getName").withArgs("formal").evalable())
