// profiles.js

require("babelify/polyfill");
let $ = require('jquery'),
    Backbone = require('backbone'),
    router = require('./routers/prf-router'),
    AppView = require('./views/prf-app-view');

new AppView();
Backbone.history.start(/*{ pushState: true, root: '/public/search/' }*/);
