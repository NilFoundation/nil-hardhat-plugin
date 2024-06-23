"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBlockByNumber = void 0;
const interceptors_1 = require("../interceptors");
async function getBlockByNumber(method, params, context) {
    const preparedParams = prepareInput(params);
    const response = await (0, interceptors_1.executeOriginalFunction)(method, preparedParams, context);
    return adaptResponse(response);
}
exports.getBlockByNumber = getBlockByNumber;
function prepareInput(params) {
    return [1, ...params];
}
function adaptResponse(response) {
    if ("number" in response && typeof response.number === "number") {
        response.number = `0x${response.number.toString(16)}`;
    }
    return response;
}
