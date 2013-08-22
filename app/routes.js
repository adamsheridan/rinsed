(function() {
  module.exports = function(app, express) {
    var Podcast;
    Podcast = require('./controllers/PodcastController');
    app.get('/api/podcasts', Podcast.index);
    return app.get('/api/podcasts/fetch', Podcast.fetch);
  };

}).call(this);
