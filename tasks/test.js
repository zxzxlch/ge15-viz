var fs = require('fs');
var und = require('underscore');
var path = require('path')
var Q = require('q');

var html = " <div style=\"background-image: initial; background-attachment: initial; background-origin: initial; background-clip: initial; margin: 8px;\"><p>Blk 729 Clementi West Street 2 #01-346<br>Singapore 120729</p></div> ".replace(/<br[ /]*>/gi, ' ');
$(html).text().trim();