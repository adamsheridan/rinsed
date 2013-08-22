(function() {
  var async, cheerio, colors, dataJSON, fs, request;

  request = require('request');

  cheerio = require('cheerio');

  async = require('async');

  fs = require('fs');

  dataJSON = 'static/data/data.json';

  colors = require('colors');

  exports.index = function(req, res) {
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    });
    return fs.readFile(dataJSON, 'utf8', function(err, data) {
      if (err) {
        console.log(err);
        return;
      }
      data = JSON.parse(data);
      return res.end(JSON.stringify(data, null, "\t"));
    });
  };

  exports.fetch = function(req, res) {
    var parse, trim1;
    trim1 = function(str) {
      return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    };
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    });
    parse = function(data) {
      var $, $podcast, podcasts;
      $ = cheerio.load(data);
      $podcast = $('.podcasts .podcast-list-item');
      podcasts = [
        {
          timestamp: +new Date()
        }
      ];
      $podcast.each(function(i, e) {
        var podcast;
        podcast = {
          id: i,
          image: $(this)[0].attribs['data-img-src'] || '/static/images/no-image.png',
          name: $(this).find('.headline').text().trim(),
          date: $(this).attr('data-air_day'),
          time: $(this).attr('data-airtime'),
          url: $(this).find('.download a').attr('href')
        };
        return podcasts.push(podcast);
      });
      data = JSON.stringify(podcasts, null, "\t");
      return fs.writeFile(dataJSON, data, function(err) {
        var date;
        if (err) {
          return console.log(err);
        } else {
          date = String(new Date).yellow;
          console.log('data.json updated'.green);
          console.log(date);
          return res.end('Data fetched at ' + new Date());
        }
      });
    };
    return async.series([
      function(callback) {
        return request('http://rinse.fm/podcasts/?page=1', function(error, response, body) {
          var $, podcasts;
          $ = cheerio.load(body);
          podcasts = $('#podcasts-listing');
          return callback(null, podcasts);
        });
      }, function(callback) {
        return request('http://rinse.fm/podcasts/?page=2', function(error, response, body) {
          var $, podcasts;
          $ = cheerio.load(body);
          podcasts = $('#podcasts-listing');
          return callback(null, podcasts);
        });
      }, function(callback) {
        return request('http://rinse.fm/podcasts/?page=3', function(error, response, body) {
          var $, podcasts;
          $ = cheerio.load(body);
          podcasts = $('#podcasts-listing');
          return callback(null, podcasts);
        });
      }
    ], function(err, results) {
      var data, i;
      i = 0;
      data = void 0;
      while (i < results.length) {
        data += results[i];
        i++;
      }
      return parse(data);
    });
  };

}).call(this);
