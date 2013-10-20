
/**
 *
 * Yahoo! Weather - NodeJS Module
 *
 */


var xml2js  = require('xml2js'),
    request = require('request'),
    printf  = require('util').format;

/*
    Init
 */
var yahoo = {
    logging: false
};




module.exports = function(options, callback) {

    yahoo.logging = options.logging;

    yahoo.where(options, function(woeid) {
        //Default unit is celcius
        if(!options.unit) {
            options.unit = 'c';
        }

        yahoo.weather(woeid, options.unit, callback);
    });
};





/**
 * Report error.
 */
var onError = function(msg, callback) {
    if (yahoo.logging) {
        console.log('ERROR: ' + msg);
    }

    if (module.exports.error) {
        module.exports.error(msg);
    }

    if (callback) {
        callback(msg);
    }
};






/**
 * Get the Yahoo weather based on geolocation.
 */
yahoo.weather = function(woeid, unit, callback) {

    var url = 'http://weather.yahooapis.com/forecastrss?w='+woeid+'&u='+unit;

    if (yahoo.logging) {
        console.log('Requesting %s', url);
    }

    request(url, function(error, res, body) {

        var parser = new xml2js.Parser();

        parser.parseString(body, function (err, result) {
            if (err) { return onError('Failed to find weather: ' + err.messsage || err, callback); }
            callback(null, result);
        });
    });
};






/**
 * Get yahoo location base on geolocation.
 */
yahoo.where = function(options, callback) {

    var url = printf(
        "http://where.yahooapis.com/v1/places.q(\"%s\")?appid=%s",
        options.location,
        options.appid
    );

    if (yahoo.logging) {
        console.log('Requesting %s', url);
    }

    request(url, function(error, res, body) {

        var parser = new xml2js.Parser();

        if (body) {
            parser.parseString(body, function (err, result) {
                try {
                    var woeid = result.place.locality1["@"].woeid;
                    callback(woeid);
                } catch(e) {
                    onError('Failed to fetch woeid', callback);
                }
            });
        } else {
            onError(error, callback);
        }
    });
};
