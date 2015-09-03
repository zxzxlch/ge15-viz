// profiles.js

require("babelify/polyfill");
let $ = require('jquery'),
    Backbone = require('backbone'),
    router = require('./routers/prf-router'),
    AppView = require('./views/prf-app-view');

Backbone.history.start(/*{ pushState: true, root: '/public/search/' }*/);
new AppView();
