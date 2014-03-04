require.config({
  paths: {
    'async': '../../bower_components/requirejs-plugins/src/async',
    'jquery': '../../bower_components/jquery/dist/jquery',
    'leaflet': '//cdn.leafletjs.com/leaflet-0.7.2/leaflet',
    'underscore': '../../bower_components/underscore/underscore',
    'backbone': '../../bower_components/backbone/backbone',
    'moment': '../../bower_components/moment/moment',
    'moment-lang-cs': '../../bower_components/moment/lang/cs',
    'moment-timezone': '../../bower_components/moment-timezone/moment-timezone',
    'bootstrap': '//netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap',

    'view': 'containers/view',
    'geo-util': 'containers/geo-util',
    'gmaps': 'containers/gmaps',
    'config': 'containers/config',
    'map': 'containers/map',
    'leaflet-google': 'containers/leaflet-google',
    'collection': 'containers/collection',
    'model': 'containers/model',
    'app-state': 'containers/app-state',
    'google-analytics-amd': 'containers/google-analytics-amd',
    'moment-timezone-data': 'containers/moment-timezone-data'
  },
  shim: {
    'leaflet': {
      exports: 'L'
    },
    'bootstrap': {
      deps: ['jquery']
    },
    'underscore': {
      exports: '_'
    }
  }
});

require(['containers/main']);