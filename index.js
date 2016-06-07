var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var pg = require('pg');

app.set('port', (process.env.PORT || 5000));

//app.use(express.static(__dirname + '/public'));
app.use(express.static('public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/db', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM inno_restaurant ORDER BY star DESC', function(err, result) {
      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       { response.render('pages/db', {results: result.rows} ); }
    });
  });
})

app.get('/api/v1/listall', function(req, res) {
//	var connectionString = "postgres://twzeobmbmpaljl:rxezNy-qPvJ0TUsrpMPCZc0iaX@ec2-23-21-157-223.compute-1.amazonaws.com:5432/d7m5nep2mhtjhe?ssl=true";
	var connectionString = process.env.DATABASE_URL;
//	var connectionString = 'postgres://localhost:5432/';
    var results = [];

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
          done();
          console.log(err);
          return res.status(500).json({ success: false, data: err});
        }

        // SQL Query > Select Data
        var query = client.query("SELECT * FROM inno_restaurant ORDER BY cat DESC, star DESC");

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(results);
        });

    });

});

app.get('/api/v1/drink', function(req, res) {
    var connectionString = process.env.DATABASE_URL;
    var results = [];

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
          done();
          console.log(err);
          return res.status(500).json({ success: false, data: err});
        }

        // SQL Query > Select Data
        var query = client.query("SELECT * FROM inno_restaurant WHERE cat = '0' ORDER BY star DESC");

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(results);
        });

    });

});

app.get('/api/v1/restaurant', function(req, res) {
    var connectionString = process.env.DATABASE_URL;
    var results = [];

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
          done();
          console.log(err);
          return res.status(500).json({ success: false, data: err});
        }

        // SQL Query > Select Data
        var query = client.query("SELECT * FROM inno_restaurant WHERE cat = '1' ORDER BY star DESC");

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(results);
        });

    });

});

app.use(bodyParser.urlencoded({ extended: true }));
app.post("/add", function(req, res){
	var name = req.body.name;
	var address = req.body.address;
	var lat = req.body.lat;
	var lng = req.body.lng;
	var price = req.body.price;
	var star = req.body.star * 10;

	var post = {name: name, address: address, lat: lat, lng: lng, price: price, star: star};


	var connectionString = process.env.DATABASE_URL;
	pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
          done();
          console.log(err);
          return res.status(500).json({ success: false, data: err});
        }
        // SQL Query > Insert Data
		var query = client.query("INSERT INTO inno_restaurant(name, address, lat, lng, price, star, cat) " + 
			"VALUES ($1, $2, $3, $4, $5, $6, $7)", [name, address, lat, lng, price, star, cat], function(err, result){
				if(err) {
					console.log(err);
				} else {
					done;
					res.redirect("/")
				}
		});
    });
	
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
