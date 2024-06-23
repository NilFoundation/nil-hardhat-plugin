"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeOriginalFunction = exports.unifiedInterceptor = void 0;
const blockNumber_1 = require("./handlers/blockNumber");
const call_1 = require("./handlers/call");
const chainId_1 = require("./handlers/chainId");
const estimateGas_1 = require("./handlers/estimateGas");
const gasPrice_1 = require("./handlers/gasPrice");
const getBlockByNumber_1 = require("./handlers/getBlockByNumber");
const getTransactionByHash_1 = require("./handlers/getTransactionByHash");
const getTransactionCount_1 = require("./handlers/getTransactionCount");
const getTransactionReceipt_1 = require("./handlers/getTransactionReceipt");
const sendTransaction_1 = require("./handlers/sendTransaction");
async function unifiedInterceptor(method, params, context) {
    switch (method) {
        case "eth_getTransactionReceipt":
            return (0, getTransactionReceipt_1.getTransactionReceipt)(method, params, context);
        case "eth_getTransactionByHash":
            return (0, getTransactionByHash_1.getTransactionByHash)(method, params, context);
        case "eth_getTransactionCount":
            return (0, getTransactionCount_1.getTransactionCount)(method, params, context);
        case "eth_sendTransaction":
            return (0, sendTransaction_1.sendTransaction)(params, context);
        case "eth_getBlockByNumber":
            return (0, getBlockByNumber_1.getBlockByNumber)(method, params, context);
        case "eth_blockNumber":
            return (0, blockNumber_1.blockNumber)(method, params, context);
        case "eth_estimateGas":
            return (0, estimateGas_1.estimateGas)(method, params, context);
        case "eth_gasPrice":
            return (0, gasPrice_1.gasPrice)(method, params, context);
        case "eth_call":
            return (0, call_1.call)(method, params, context);
        case "eth_chainId":
            return (0, chainId_1.chainId)(method, params, context);
        default:
            if (context.isRequest) {
                return await context.originalRequest({ method: method, params: params });
            }
            else {
                return await context.originalSend(method, params);
            }
    }
}
exports.unifiedInterceptor = unifiedInterceptor;
async function executeOriginalFunction(method, params, context) {
    if (context.isRequest) {
        return await context.originalRequest({ method, params });
    }
    else {
        return await context.originalSend(method, params);
    }
}
exports.executeOriginalFunction = executeOriginalFunction;
