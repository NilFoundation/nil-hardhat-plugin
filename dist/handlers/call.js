"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.call = void 0;
const interceptors_1 = require("../interceptors");
async function call(method, params, context) {
    const preparedParams = prepareInput(params);
    // For contract deployment skip call, as we have async message from wallet
    if (preparedParams[0] && preparedParams[0].to === undefined) {
        return "0x0";
    }
    return await (0, interceptors_1.executeOriginalFunction)(method, preparedParams, context);
}
exports.call = call;
function prepareInput(params) {
    if (params[0].to !== undefined) {
        if (params[0]) {
            params[0].gasLimit = "0xf4240";
            params[0].from = params[0].to;
            params[0].value = 0;
        }
    }
    return params;
}
