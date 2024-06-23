"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const interceptors_1 = require("./interceptors");
const setup_1 = require("./setup");
(0, config_1.extendEnvironment)(async (hre) => {
    const context = await (0, setup_1.setupWalletAndClient)(hre);
    hre.network.provider.send = (method, params) => {
        context.isRequest = false;
        return (0, interceptors_1.unifiedInterceptor)(method, params || [], context);
    };
    hre.network.provider.request = (args) => {
        context.isRequest = true;
        const safeParams = Array.isArray(args.params)
            ? args.params
            : args.params
                ? [args.params]
                : [];
        return (0, interceptors_1.unifiedInterceptor)(args.method, safeParams, context);
    };
});
