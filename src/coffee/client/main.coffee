window.App =
	Models: {}
	Views: {}
	Collections: {}

class Podcast extends Backbone.Model

class Player extends Backbone.Model
	defaults:
		pid: null #podcast id

	initialize: =>
		@on 'change:pid', @loadPodcast, @

	loadPodcast: =>
		pid = @get('pid')
		@podcast = App.Collections.Podcasts.get(pid)
		App.Views.Player.play(@podcast)
		@syncView()

	syncView: =>
		App.Views.Player.updateMeta(@podcast)


class PodcastCollection extends Backbone.Collection
	model: Podcast
	url: '/api/podcasts/'

	removeTimestamp: =>
		timestamp = App.Collections.Podcasts.first()
		App.Collections.Podcasts.remove( timestamp )

	latest: =>
		return App.Collections.Podcasts.first()

class AppView extends Backbone.View
	initialize: =>
		App.Models.Podcast = new Podcast()
		App.Collections.Podcasts = new PodcastCollection()
		App.Views.Podcasts = new PodcastView( collection: App.Collections.Podcasts )

class PodcastView extends Backbone.View
	initialize: =>
		that = @
		@collection.fetch(
			error: -> console.log 'Error fetching Podcasts collection'
		).complete(->
			App.Collections.Podcasts.removeTimestamp()
			App.Views.Player = new PlayerView()
			that.render()
		)
		
	events: 
		'click .podcast .play':'playPodcast'

	el: '.podcasts'

	template: _.template($('#podcastsTemplate').html())

	render: =>
		tmpl = @template( podcasts: @collection.toJSON() )
		@$el.html tmpl 

	playPodcast: (e) =>
		e.preventDefault()
		pid = $(e.target).data('id')
		App.Models.Player.set('pid', pid)

class PlayerView extends Backbone.View
	initialize: =>
		App.Models.Player = new Player()

		try
			@audioCtx = new webkitAudioContext()
		catch e
			console.log 'Browser does not support webkitAudioContext()'
		
	el: '.player'

	metaTemplate: _.template($('#playerMetaTemplate').html())

	metaEl: '.playing-meta'

	events: 
		'click .controls .pause a':'pause'
		'click .controls .unpause a':'pause'
		'click .controls .mute a':'mute'

	updateMeta: (model) =>
		tmpl = @metaTemplate( podcast: model.toJSON() )
		$(@metaEl).html(tmpl)

	play: (model) =>
		console.log('playing: ', model.get('name'))

		@$el.addClass('playing')
		$('.controls .play').removeClass('play').addClass('pause')
		if @audio then @audio.remove()
		if @sourceNode then @sourceNode.disconnect()
		window.cancelAnimationFrame(App.Views.VisualisationView.animationFrame)

		@audio = new Audio()
		@audio.src = model.get('url')

		that = @
		@audio.addEventListener 'canplay', () ->
			that.setupNodes()
		, false

	pause: (e) =>
		e.preventDefault()
		if @audio.paused == true
			@audio.play()
			$('.controls .unpause').removeClass('unpause').addClass('pause')
			App.Views.VisualisationView.toggleFade()
		else 
			@audio.pause()
			$('.controls .pause').removeClass('pause').addClass('unpause')
			App.Views.VisualisationView.toggleFade()

	mute: (e) =>
		e.preventDefault()
		if @audio.muted == true
			@audio.muted = false
			$(e.target).parent().removeClass('muted')
			App.Views.VisualisationView.toggleFade()
		else 
			@audio.muted = true
			$(e.target).parent().addClass('muted')
			App.Views.VisualisationView.toggleFade()

	# WebAudio setup
	setupNodes: =>
		@analyser = @analyser || @audioCtx.createAnalyser()
		@sourceNode = @audioCtx.createMediaElementSource(@audio)
		@sourceNode.connect(@analyser)
		@analyser.connect(@audioCtx.destination)
		@audio.play()
		App.Views.VisualisationView.draw()

	createAudio: =>
		if @audio then @audio.remove()
		@audio = new Audio()

class VisualisationView extends Backbone.View
	canvas: $('#canvas')[0]

	initialize: =>
		@canvasCtx = @canvas.getContext '2d'
		@canvas.width = window.innerWidth
		@canvas.height = window.innerHeight

	draw: =>
		@animationFrame = window.requestAnimationFrame(@draw)

		width = window.innerWidth
		height = window.innerHeight

		@canvasCtx.fillStyle = 'rgba(0,0,0,1)'
		@canvasCtx.fillRect 0,0,width,height

		data = new Uint8Array(1024)
		App.Views.Player.analyser.getByteFrequencyData(data)

		gradient = @canvasCtx.createLinearGradient(0, 0, 0, height)
		gradient.addColorStop(1, '#000000')
		gradient.addColorStop(0.95, '#000000')
		gradient.addColorStop(0, '#808080')

		i = 0
		while i < data.length
			@canvasCtx.fillStyle = gradient
			@canvasCtx.fillRect(i*7,data[i]+height/2,2,height+height/2)
			i++

	toggleFade: =>
		el = $(canvas)
		if el.hasClass('visible')
			el.removeClass('visible').fadeOut()
		else
			el.addClass('visible').fadeIn()

App.Views.Index = new AppView()
App.Views.VisualisationView = new VisualisationView()