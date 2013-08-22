## Rinsed

Rinsed is a project created to explore CoffeeScript, Backbone and Node and for me to improve and expand my skillset. It is a simple application that provides a pretty interface for RinseFM's podcasts. Unfortnately RinseFM's RSS feed is not maintained so all content is scraped directly from RinseFM's website and is therefore prone to breakage. Using Node's Request and Cheerio modules we provide a simple API (stored in a flat JSON file) to the Backbone/MVC front-end. Added UI sugar with canvas/Web Audio API.

	$ npm install
	$ cd app && node server.js

This application is dependant on HTML5 Audio MP3 support, for best results use Google Chrome.

