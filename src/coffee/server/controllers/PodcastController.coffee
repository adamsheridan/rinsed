request = require 'request'
cheerio = require 'cheerio'
async = require 'async'
fs = require 'fs'
dataJSON = 'static/data/data.json'
colors = require 'colors'

exports.index = (req, res) ->

	res.writeHead(200,
		"Content-Type" : "application/json"
		"Access-Control-Allow-Origin" : "*"
	)

	fs.readFile dataJSON, 'utf8', (err, data) ->
		if err 
			console.log err
			return

		data = JSON.parse data
		res.end JSON.stringify data, null, "\t"

exports.fetch = (req, res) ->

	trim1 = (str) ->
		str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');

	res.writeHead(200,
		"Content-Type" : "application/json"
		"Access-Control-Allow-Origin" : "*"
	)

	parse = (data) ->
		$ = cheerio.load(data)
		$podcast = $('.podcasts .podcast-list-item')
		podcasts = [
			timestamp: +new Date()
		]

		$podcast.each (i, e) ->
			podcast =
				id: i
				image: $(this)[0].attribs['data-img-src'] || '/static/images/no-image.png'
				name: $(this).find('.headline').text().trim()
				date: $(this).attr('data-air_day')
				time: $(this).attr('data-airtime')
				url: $(this).find('.download a').attr('href')

			podcasts.push podcast

		data = JSON.stringify podcasts, null, "\t"

		fs.writeFile dataJSON, data, (err) ->
			if err
				console.log err
			else
				date = String(new Date).yellow
				console.log('data.json updated'.green)
				console.log date
				res.end 'Data fetched at '+ new Date()

	async.series [
		(callback) ->
			request 'http://rinse.fm/podcasts/?page=1', (error, response, body) ->
				$ = cheerio.load(body)
				podcasts = $('#podcasts-listing')
				callback null, podcasts

		, (callback) ->
			request 'http://rinse.fm/podcasts/?page=2', (error, response, body) ->
				$ = cheerio.load(body)
				podcasts = $('#podcasts-listing')
				callback null, podcasts

		, (callback) ->
			request 'http://rinse.fm/podcasts/?page=3', (error, response, body) ->
				$ = cheerio.load(body)
				podcasts = $('#podcasts-listing')
				callback null, podcasts

	], (err, results) ->

		i = 0
		data = undefined

		while i < results.length
			data += results[i]
			i++
		parse(data)