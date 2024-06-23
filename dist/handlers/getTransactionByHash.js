"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionByHash = void 0;
const interceptors_1 = require("../interceptors");
async function getTransactionByHash(method, params, context) {
    const [preparedMethod, preparedParams] = prepareInput(method, params);
    const result = await (0, interceptors_1.executeOriginalFunction)(preparedMethod, preparedParams, context);
    return adaptResult(result);
}
exports.getTransactionByHash = getTransactionByHash;
function prepareInput(method, params) {
    const preparedMethod = "eth_getInMessageByHash";
    const preparedParams = [1, ...params];
    return [preparedMethod, preparedParams];
}
function adaptResult(result) {
    if (!result) {
        return result;
    }
    // Ensure hash is a string
    if (typeof result.hash !== "string") {
        result.hash = String(result.hash);
    }
    // Ensure blockNumber is a string or null
    if (typeof result.blockNumber !== "string" && result.blockNumber !== null) {
        result.blockNumber = String(result.blockNumber);
    }
    // Ensure blockHash is a string or null
    if (typeof result.blockHash !== "string" && result.blockHash !== null) {
        result.blockHash = String(result.blockHash);
    }
    // Ensure gasPrice is a string or ensure maxFeePerGas and maxPriorityFeePerGas are strings
    if ("maxFeePerGas" in result) {
        if (typeof result.maxFeePerGas !== "string") {
            result.maxFeePerGas = String(result.maxFeePerGas);
        }
        if (typeof result.maxPriorityFeePerGas !== "string") {
            result.maxPriorityFeePerGas = String(result.maxPriorityFeePerGas);
        }
    }
    else {
        if (typeof result.gasPrice !== "string") {
            result.gasPrice = String(result.gasPrice);
        }
    }
    result.nonce = result.seqno;
    return result;
}
