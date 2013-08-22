(function() {
  var AppView, Player, PlayerView, Podcast, PodcastCollection, PodcastView, VisualisationView, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.App = {
    Models: {},
    Views: {},
    Collections: {}
  };

  Podcast = (function(_super) {
    __extends(Podcast, _super);

    function Podcast() {
      _ref = Podcast.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    return Podcast;

  })(Backbone.Model);

  Player = (function(_super) {
    __extends(Player, _super);

    function Player() {
      this.syncView = __bind(this.syncView, this);
      this.loadPodcast = __bind(this.loadPodcast, this);
      this.initialize = __bind(this.initialize, this);
      _ref1 = Player.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    Player.prototype.defaults = {
      pid: null
    };

    Player.prototype.initialize = function() {
      return this.on('change:pid', this.loadPodcast, this);
    };

    Player.prototype.loadPodcast = function() {
      var pid;
      pid = this.get('pid');
      this.podcast = App.Collections.Podcasts.get(pid);
      App.Views.Player.play(this.podcast);
      return this.syncView();
    };

    Player.prototype.syncView = function() {
      return App.Views.Player.updateMeta(this.podcast);
    };

    return Player;

  })(Backbone.Model);

  PodcastCollection = (function(_super) {
    __extends(PodcastCollection, _super);

    function PodcastCollection() {
      this.latest = __bind(this.latest, this);
      this.removeTimestamp = __bind(this.removeTimestamp, this);
      _ref2 = PodcastCollection.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    PodcastCollection.prototype.model = Podcast;

    PodcastCollection.prototype.url = '/api/podcasts/';

    PodcastCollection.prototype.removeTimestamp = function() {
      var timestamp;
      timestamp = App.Collections.Podcasts.first();
      return App.Collections.Podcasts.remove(timestamp);
    };

    PodcastCollection.prototype.latest = function() {
      return App.Collections.Podcasts.first();
    };

    return PodcastCollection;

  })(Backbone.Collection);

  AppView = (function(_super) {
    __extends(AppView, _super);

    function AppView() {
      this.initialize = __bind(this.initialize, this);
      _ref3 = AppView.__super__.constructor.apply(this, arguments);
      return _ref3;
    }

    AppView.prototype.initialize = function() {
      App.Models.Podcast = new Podcast();
      App.Collections.Podcasts = new PodcastCollection();
      return App.Views.Podcasts = new PodcastView({
        collection: App.Collections.Podcasts
      });
    };

    return AppView;

  })(Backbone.View);

  PodcastView = (function(_super) {
    __extends(PodcastView, _super);

    function PodcastView() {
      this.playPodcast = __bind(this.playPodcast, this);
      this.render = __bind(this.render, this);
      this.initialize = __bind(this.initialize, this);
      _ref4 = PodcastView.__super__.constructor.apply(this, arguments);
      return _ref4;
    }

    PodcastView.prototype.initialize = function() {
      var that;
      that = this;
      return this.collection.fetch({
        error: function() {
          return console.log('Error fetching Podcasts collection');
        }
      }).complete(function() {
        App.Collections.Podcasts.removeTimestamp();
        App.Views.Player = new PlayerView();
        return that.render();
      });
    };

    PodcastView.prototype.events = {
      'click .podcast .play': 'playPodcast'
    };

    PodcastView.prototype.el = '.podcasts';

    PodcastView.prototype.template = _.template($('#podcastsTemplate').html());

    PodcastView.prototype.render = function() {
      var tmpl;
      tmpl = this.template({
        podcasts: this.collection.toJSON()
      });
      return this.$el.html(tmpl);
    };

    PodcastView.prototype.playPodcast = function(e) {
      var pid;
      e.preventDefault();
      pid = $(e.target).data('id');
      return App.Models.Player.set('pid', pid);
    };

    return PodcastView;

  })(Backbone.View);

  PlayerView = (function(_super) {
    __extends(PlayerView, _super);

    function PlayerView() {
      this.createAudio = __bind(this.createAudio, this);
      this.setupNodes = __bind(this.setupNodes, this);
      this.mute = __bind(this.mute, this);
      this.pause = __bind(this.pause, this);
      this.play = __bind(this.play, this);
      this.updateMeta = __bind(this.updateMeta, this);
      this.initialize = __bind(this.initialize, this);
      _ref5 = PlayerView.__super__.constructor.apply(this, arguments);
      return _ref5;
    }

    PlayerView.prototype.initialize = function() {
      var e;
      App.Models.Player = new Player();
      try {
        return this.audioCtx = new webkitAudioContext();
      } catch (_error) {
        e = _error;
        return console.log('Browser does not support webkitAudioContext()');
      }
    };

    PlayerView.prototype.el = '.player';

    PlayerView.prototype.metaTemplate = _.template($('#playerMetaTemplate').html());

    PlayerView.prototype.metaEl = '.playing-meta';

    PlayerView.prototype.events = {
      'click .controls .pause a': 'pause',
      'click .controls .unpause a': 'pause',
      'click .controls .mute a': 'mute'
    };

    PlayerView.prototype.updateMeta = function(model) {
      var tmpl;
      tmpl = this.metaTemplate({
        podcast: model.toJSON()
      });
      return $(this.metaEl).html(tmpl);
    };

    PlayerView.prototype.play = function(model) {
      var that;
      console.log('playing: ', model.get('name'));
      this.$el.addClass('playing');
      $('.controls .play').removeClass('play').addClass('pause');
      if (this.audio) {
        this.audio.remove();
      }
      if (this.sourceNode) {
        this.sourceNode.disconnect();
      }
      window.cancelAnimationFrame(App.Views.VisualisationView.animationFrame);
      this.audio = new Audio();
      this.audio.src = model.get('url');
      that = this;
      return this.audio.addEventListener('canplay', function() {
        return that.setupNodes();
      }, false);
    };

    PlayerView.prototype.pause = function(e) {
      e.preventDefault();
      if (this.audio.paused === true) {
        this.audio.play();
        $('.controls .unpause').removeClass('unpause').addClass('pause');
        return App.Views.VisualisationView.toggleFade();
      } else {
        this.audio.pause();
        $('.controls .pause').removeClass('pause').addClass('unpause');
        return App.Views.VisualisationView.toggleFade();
      }
    };

    PlayerView.prototype.mute = function(e) {
      e.preventDefault();
      if (this.audio.muted === true) {
        this.audio.muted = false;
        $(e.target).parent().removeClass('muted');
        return App.Views.VisualisationView.toggleFade();
      } else {
        this.audio.muted = true;
        $(e.target).parent().addClass('muted');
        return App.Views.VisualisationView.toggleFade();
      }
    };

    PlayerView.prototype.setupNodes = function() {
      this.analyser = this.analyser || this.audioCtx.createAnalyser();
      this.sourceNode = this.audioCtx.createMediaElementSource(this.audio);
      this.sourceNode.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);
      this.audio.play();
      return App.Views.VisualisationView.draw();
    };

    PlayerView.prototype.createAudio = function() {
      if (this.audio) {
        this.audio.remove();
      }
      return this.audio = new Audio();
    };

    return PlayerView;

  })(Backbone.View);

  VisualisationView = (function(_super) {
    __extends(VisualisationView, _super);

    function VisualisationView() {
      this.toggleFade = __bind(this.toggleFade, this);
      this.draw = __bind(this.draw, this);
      this.initialize = __bind(this.initialize, this);
      _ref6 = VisualisationView.__super__.constructor.apply(this, arguments);
      return _ref6;
    }

    VisualisationView.prototype.canvas = $('#canvas')[0];

    VisualisationView.prototype.initialize = function() {
      this.canvasCtx = this.canvas.getContext('2d');
      this.canvas.width = window.innerWidth;
      return this.canvas.height = window.innerHeight;
    };

    VisualisationView.prototype.draw = function() {
      var data, gradient, height, i, width, _results;
      this.animationFrame = window.requestAnimationFrame(this.draw);
      width = window.innerWidth;
      height = window.innerHeight;
      this.canvasCtx.fillStyle = 'rgba(0,0,0,1)';
      this.canvasCtx.fillRect(0, 0, width, height);
      data = new Uint8Array(1024);
      App.Views.Player.analyser.getByteFrequencyData(data);
      gradient = this.canvasCtx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(1, '#000000');
      gradient.addColorStop(0.95, '#000000');
      gradient.addColorStop(0, '#808080');
      i = 0;
      _results = [];
      while (i < data.length) {
        this.canvasCtx.fillStyle = gradient;
        this.canvasCtx.fillRect(i * 7, data[i] + height / 2, 2, height + height / 2);
        _results.push(i++);
      }
      return _results;
    };

    VisualisationView.prototype.toggleFade = function() {
      var el;
      el = $(canvas);
      if (el.hasClass('visible')) {
        return el.removeClass('visible').fadeOut();
      } else {
        return el.addClass('visible').fadeIn();
      }
    };

    return VisualisationView;

  })(Backbone.View);

  App.Views.Index = new AppView();

  App.Views.VisualisationView = new VisualisationView();

}).call(this);
