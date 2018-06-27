'use strict';

/**
 * @namespace Egg
 */

/**
 * Start egg application with cluster mode
 * @since 1.0.0
 */
exports.startCluster = require('egg-cluster').startCluster({
    baseDir: __dirname,
    port: 6001,
    workers: 1, // default to cpu count
});