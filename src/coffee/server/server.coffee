express = require 'express'
http = require 'http'
app = express()
server = http.createServer(app)
fs = require 'fs'
colors = require 'colors'
schedule = require 'node-schedule'
request = require 'request'

rule = new schedule.RecurrenceRule()
rule.minute = 0

fetch = () ->
	request 'http://localhost:9000/api/podcasts/fetch', (e, r, b) ->

job = schedule.scheduleJob rule, ->
		fetch()

app.configure ->
	app.set 'title', 'RinsedFM'
	app.use express.bodyParser()

	app.use '/static', express.static __dirname + '/static'
	app.use '/static/js', express.static __dirname + '/static/js'
	app.use '/static/js/vendor', express.static __dirname + '/static/js/vendor'
	app.use '/static/css', express.static __dirname + '/static/css'
	app.use '/static/images', express.static __dirname + '/static/images'
	app.use '/static/data', express.static __dirname + '/static/data'
	app.use('/', express.static(__dirname + '/static'));

routes = require './routes.js'
routes(app, express)

fetch()

port = process.env.PORT || 9000

server.listen port, () ->
	console.log 'Server Running on port '.green+port