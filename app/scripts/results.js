// profiles.js

require("babelify/polyfill");
let $ = require('jquery'),
    Backbone = require('backbone'),
    router = require('./routers/viz-router'),
    AppView = require('./views/rs-app-view');

new AppView();
Backbone.history.start(/*{ pushState: true, root: '/public/search/' }*/);
