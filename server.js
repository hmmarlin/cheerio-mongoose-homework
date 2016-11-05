var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');

var request = require('request');
var cheerio = require('cheerio');


app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: false
}));


app.use(express.static('public'));


// mongoose.connect('mongodb://localhost/headlines');


var databaseUri = 'mongodb://localhost/headlines';
if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI);
} else {
    mongoose.connect(databaseUri);
}

var db = mongoose.connection;

db.on('error', function(err) {
    console.log('Mongoose Error: ', err);
});


db.once('open', function() {
    console.log('Mongoose connection successful.');
});



var Note = require('./models/Note.js');
var Article = require('./models/Article.js');


// Routes
// ======


app.get('/', function(req, res) {
    res.send(index.html);
});

app.get('/scrape', function(req, res) {
    request('http://www.theonion.com/section/local', function(error, response, html) {
        var $ = cheerio.load(html);
        $('div.info').each(function(i, element) {

            var result = {};


            result.title = $(this).children('div.inner').children('header').children('h2.headline').children('a').text().trim();
            var url = $(this).children('div.inner').children('header').children('h2.headline').children('a').attr('href').trim();
            result.link = 'http://www.theonion.com' + url;
            result.summary = $(this).children('div.inner').children('div.desc').text().trim();
            result.image = $(this).children('figure.thumb').children('a').children('div.image').children('noscript').children('img').attr('src');
            var entry = new Article(result);

            entry.save(function(err, doc) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(doc);
                }
            });


        });
    });
    res.redirect('/');
});

app.get('/articles', function(req, res) {
    Article.find({}, function(err, doc) {
        if (err) {
            console.log(err);
        } else {
            res.json(doc);
        }
    });
});

app.get('/articles/:id', function(req, res) {

    Article.findOne({ '_id': req.params.id })
        .populate('note')
        .exec(function(err, doc) {
            if (err) {
                console.log(err);
            } else {
                res.json(doc);
            }
        });
});



app.post('/articles/:id', function(req, res) {
    var newNote = new Note(req.body);

    newNote.save(function(err, doc) {
        if (err) {
            console.log(err);
        } else {

            Article.findOneAndUpdate({ '_id': req.params.id }, { 'note': doc._id })
                .exec(function(err, doc) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.send(doc);
                    }
                });
        }
    });
});







// listen on port 3000
app.listen(3000, function() {
    console.log('App running on port 3000!');
});
