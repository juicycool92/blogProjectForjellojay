"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var combineMiddlewares = exports.combineMiddlewares = function combineMiddlewares() {
  for (var _len = arguments.length, middlewares = Array(_len), _key = 0; _key < _len; _key++) {
    middlewares[_key] = arguments[_key];
  }

  return function () {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    var chain = middlewares.concat(function () {});
    var next = function next() {
      return chain.shift().apply(undefined, args.concat([next]));
    };
    return next();
  };
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9taWRkbGV3YXJlLmpzIl0sIm5hbWVzIjpbImNvbWJpbmVNaWRkbGV3YXJlcyIsIm1pZGRsZXdhcmVzIiwiYXJncyIsImNoYWluIiwiY29uY2F0IiwibmV4dCIsInNoaWZ0Il0sIm1hcHBpbmdzIjoiOzs7OztBQUFPLElBQU1BLGtEQUFxQixTQUFyQkEsa0JBQXFCO0FBQUEsb0NBQUlDLFdBQUo7QUFBSUEsZUFBSjtBQUFBOztBQUFBLFNBQW9CLFlBQWE7QUFBQSx1Q0FBVEMsSUFBUztBQUFUQSxVQUFTO0FBQUE7O0FBQ2pFLFFBQU1DLFFBQVFGLFlBQVlHLE1BQVosQ0FBbUIsWUFBTSxDQUFFLENBQTNCLENBQWQ7QUFDQSxRQUFNQyxPQUFPLFNBQVBBLElBQU87QUFBQSxhQUFNRixNQUFNRyxLQUFOLG9CQUFpQkosSUFBakIsU0FBdUJHLElBQXZCLEdBQU47QUFBQSxLQUFiO0FBQ0EsV0FBT0EsTUFBUDtBQUNELEdBSmlDO0FBQUEsQ0FBM0IiLCJmaWxlIjoibWlkZGxld2FyZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCBjb21iaW5lTWlkZGxld2FyZXMgPSAoLi4ubWlkZGxld2FyZXMpID0+ICguLi5hcmdzKSA9PiB7XG4gIGNvbnN0IGNoYWluID0gbWlkZGxld2FyZXMuY29uY2F0KCgpID0+IHt9KVxuICBjb25zdCBuZXh0ID0gKCkgPT4gY2hhaW4uc2hpZnQoKSguLi5hcmdzLCBuZXh0KVxuICByZXR1cm4gbmV4dCgpXG59XG4iXX0=