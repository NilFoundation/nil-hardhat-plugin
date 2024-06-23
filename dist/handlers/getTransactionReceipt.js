"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionReceipt = void 0;
const interceptors_1 = require("../interceptors");
async function getTransactionReceipt(method, params, context) {
    const [preparedMethod, preparedParams] = prepareInput(method, params);
    const result = await (0, interceptors_1.executeOriginalFunction)(preparedMethod, preparedParams, context);
    return adaptResponse(result, preparedParams);
}
exports.getTransactionReceipt = getTransactionReceipt;
function prepareInput(method, params) {
    return ["eth_getInMessageReceipt", [1, ...params]];
}
function adaptResponse(result, params) {
    if (!result) {
        return null;
    }
    result.hash = String(result.blockHash);
    result.blockNumber = String(result.blockNumber);
    result.status = typeof result.success === "boolean" ? (result.success ? "0x1" : "0x0") : result.success;
    result.contractAddress = result.contractAddress ? String(result.contractAddress) : null;
    result.gasUsed = String(result.gasUsed);
    result.logs = [];
    result.index = 1;
    result.hash = params[1];
    result.cumulativeGasUsed = result.gasUsed;
    return result;
}
