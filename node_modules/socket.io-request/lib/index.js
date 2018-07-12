'use strict';

var _main = require('./main');

var _main2 = _interopRequireDefault(_main);

var _error = require('./error');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function (io, options) {
  return new _main2.default(io, options);
};
Object.assign(module.exports, { TimeoutError: _error.TimeoutError, SocketIOError: _error.SocketIOError });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJtb2R1bGUiLCJleHBvcnRzIiwiaW8iLCJvcHRpb25zIiwiT2JqZWN0IiwiYXNzaWduIiwiVGltZW91dEVycm9yIiwiU29ja2V0SU9FcnJvciJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7OztBQUNBOzs7O0FBRUFBLE9BQU9DLE9BQVAsR0FBaUIsVUFBQ0MsRUFBRCxFQUFLQyxPQUFMO0FBQUEsU0FBaUIsbUJBQW9CRCxFQUFwQixFQUF3QkMsT0FBeEIsQ0FBakI7QUFBQSxDQUFqQjtBQUNBQyxPQUFPQyxNQUFQLENBQWNMLE9BQU9DLE9BQXJCLEVBQThCLEVBQUNLLGlDQUFELEVBQWVDLG1DQUFmLEVBQTlCIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFNvY2tldElPUmVxdWVzdCBmcm9tICcuL21haW4nXG5pbXBvcnQge1RpbWVvdXRFcnJvciwgU29ja2V0SU9FcnJvcn0gZnJvbSAnLi9lcnJvcidcblxubW9kdWxlLmV4cG9ydHMgPSAoaW8sIG9wdGlvbnMpID0+IG5ldyBTb2NrZXRJT1JlcXVlc3QoaW8sIG9wdGlvbnMpXG5PYmplY3QuYXNzaWduKG1vZHVsZS5leHBvcnRzLCB7VGltZW91dEVycm9yLCBTb2NrZXRJT0Vycm9yfSlcbiJdfQ==