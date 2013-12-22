var config      = require('config'),
    pg          = require('pg-query')

var pg_config   = config.pg_config,
    schema_name = config.schema_name;
pg.connectionParameters = pg_config + '/' + schema_name;

var error_response = "Schema already exists - bypassing db initialization step\n";

function createDBSchema(err, rows, result) {
  if(err && err.code == "ECONNREFUSED"){
    return console.error("DB connection unavailable, see README notes for setup assistance\n", err);
  }
  var table_name = 'odpad';
  var query = "CREATE TABLE "+table_name+" ( gid serial NOT NULL," +
    "name character varying(240), " +
    "time_from TIMESTAMP NOT NULL, " +
    "time_to TIMESTAMP NOT NULL, " +
    "the_geom geometry, " +
    "CONSTRAINT "+table_name+ "_pkey PRIMARY KEY (gid), " +
    "CONSTRAINT "+table_name+"_enforce_dims_geom CHECK (st_ndims(the_geom) = 2), " +
    "CONSTRAINT "+table_name+"_enforce_geotype_geom CHECK (geometrytype(the_geom) = 'POINT'::text OR the_geom IS NULL), " +
    "CONSTRAINT "+table_name+"_enforce_srid_geom CHECK (st_srid(the_geom) = 4326), " +
    "UNIQUE (name, time_from, time_to)" +
    ") WITH ( OIDS=FALSE );";
  pg(query, addSpatialIndex);
}

function addSpatialIndex(err, rows, result) {
  if(err) {
    return console.error(error_response, err);
  }
  var table_name = 'odpad';
  pg("CREATE INDEX "+table_name+"_geom_gist ON "+table_name+" USING gist (the_geom);", addKnownPlaces);
}

function addKnownPlaces(err, rows, result) {
  if(err) {
    return console.error(error_response, err);
  }
  var table_name = 'known_places';
  var query = "CREATE TABLE "+table_name+" ( gid serial NOT NULL, name character varying(240), the_geom geometry, CONSTRAINT "+table_name+"_pkey PRIMARY KEY (gid), CONSTRAINT "+table_name+"_enforce_dims_geom CHECK (st_ndims(the_geom) = 2), CONSTRAINT "+table_name+"_enforce_geotype_geom CHECK (geometrytype(the_geom) = 'POINT'::text OR the_geom IS NULL), CONSTRAINT "+table_name+"_enforce_srid_geom CHECK (st_srid(the_geom) = 4326) ) WITH ( OIDS=FALSE );";
  pg(query, function(err, rows, result) {
    if(err) {
      return console.error(error_response, err);
    }
    var response = 'Database initialized!';
    return response;
  });
}

function importMapPoints(places) {
  console.info('Importing places to DB')
  var insert = 'INSERT INTO odpad (name, time_from, time_to) VALUES ($1::text, $2::timestamp, $3::timestamp);';
  for (var i = 0; i < places.length; i++) {
    pg(insert, places[i], function(err, rows, result) {
      if(err) {
        return console.error(error_response, err);
      }
    });
  }
}

function init_db(){
  pg('CREATE EXTENSION postgis;', createDBSchema);
} 

function flush_db(){
  pg('DROP TABLE odpad;', function(err, rows, result){
    var response = 'Table ODPAD dropped!';
    console.log(response);
    return response;
  });
  pg('DROP TABLE known_places;', function(err, rows, result){
    var response = 'Table KNOWN_PLACES dropped!';
    console.log(response);
    return response;
  });
  pg('DROP TABLE odpad_import;', function(err, rows, result){
    var response = 'Table ODPAD_IMPORT dropped!';
    console.log(response);
    return response;
  });
}

function select_box(req, res, next){
  //clean these variables:
  var query = req.query;
  var limit = (typeof(query.limit) !== "undefined") ? query.limit : 40;
  if(!(Number(query.lat1) 
    && Number(query.lon1) 
    && Number(query.lat2) 
    && Number(query.lon2)
    && Number(limit)))
  {
    res.send(500, {http_status:400,error_msg: "this endpoint requires two pair of lat, long coordinates: lat1 lon1 lat2 lon2\na query 'limit' parameter can be optionally specified as well."});
    return console.error('could not connect to postgres', err);
  }
  pg('SELECT gid,name,ST_X(the_geom) as lon,ST_Y(the_geom) as lat FROM odpad t WHERE ST_Intersects( ST_MakeEnvelope('+query.lon1+", "+query.lat1+", "+query.lon2+", "+query.lat2+", 4326), t.the_geom) LIMIT "+limit+';', function(err, rows, result){
    if(err) {
      res.send(500, {http_status:500,error_msg: err})
      return console.error('error running query', err);
    }
    res.send(rows);
    return rows;
  })
}

function select_all(req, res, next){
  console.log(pg);
  pg('SELECT gid,name,ST_X(the_geom) as lon,ST_Y(the_geom) as lat FROM odpad;', function(err, rows, result) {
    console.log(config);
    if(err) {
      res.send(500, {http_status:500,error_msg: err})
      return console.error('error running query', err);
    }
    res.send(result);
    return rows;
  });
}

module.exports = exports = {
  selectAll:        select_all,
  selectBox:        select_box,
  flushDB:          flush_db,
  initDB:           init_db,
  importMapPoints:  importMapPoints
};
