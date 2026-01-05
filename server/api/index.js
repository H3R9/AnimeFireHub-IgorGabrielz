const { addonInterface } = require('../server');
const { getRouter } = require('stremio-addon-sdk');
const express = require('express');

const app = express();
const router = getRouter(addonInterface);

app.use('/', router);

module.exports = app;
