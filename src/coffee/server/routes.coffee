module.exports = (app, express) ->

	Podcast = require './controllers/PodcastController'
	
	app.get '/api/podcasts', Podcast.index
	app.get '/api/podcasts/fetch', Podcast.fetch