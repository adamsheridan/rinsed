#!/bin/bash
echo "Compiling coffee..."
coffee --join public/js/app.js --compile src/coffee/router src/coffee/models src/coffee/view src/coffee/App.coffee
echo "OK."