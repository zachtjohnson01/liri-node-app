require('dotenv').config();

var keys = require('./keys.js');
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');
var request = require('request');
var fs = require('fs');
// var movieTitle;

var spotify = new Spotify(keys.spotify);
var client = new Twitter(keys.twitter);

var userRequest = process.argv[2];
var userRequestItem = process.argv.slice(3).join(' ');
// console.log(userRequestItem);

switch(userRequest) {
    case 'my-tweets':
        collectTweets(userRequestItem);
        break;
    case 'spotify-this-song':
        returnSong(userRequestItem);
        break;
    case 'movie-this':
        returnMovie(userRequestItem);
        break;
    case 'do-what-it-says':
        doWhatItSays();
        break;
    case 'options':
        console.log('LIRI Arguments:')
        console.log('my-tweets')
        console.log('spotify-this-song')
        console.log('movie-this')
        console.log('do-what-it-says');
        break;
    default: 
        console.log("I'm sorry, I didn't get that")
};


function collectTweets(handle) {
    var params = {
        screen_name: handle,
        count:20
    };
    client.get('statuses/user_timeline', params, function(error, tweets, response) {
        if (!error) {
            tweets.forEach(function(t){
                console.log(`${t.created_at} : ${t.text}`);
            })
        }
    })
};

function returnSong(song) {
    var Track = null;
    if (!song){
        Track = 'The Sign - Ace of Base'
    } else {
        Track = song
    };
    spotify.search({
        type: 'track',
        query: Track,
        limit: 10
    }, function(err,data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }
        data.tracks.items.forEach(function(s) {
            s.artists.map(function(a) {
                console.log(`Artist: ${a.name}`)
            })
            console.log(`Song Name: ${s.name}`);
            console.log(`Preview Link: ${s.preview_url}`);
            console.log(`Album Name: ${s.album.name}`);
        })
    });
};

function returnMovie(movieTitle) {
    var Title = null;
    if (!movieTitle) {
        Title = 'Mr. Nobody'
    } else {
        Title = movieTitle
    };
    request('http://www.omdbapi.com/?apikey=trilogy&t='+ Title, function (err, response, body) {
        if (err) {
            return console.log('Error occurred: ' + err);
        } else if (movieTitle = undefined) {
            movieTitle = 'Mr. Nobody';
        } else {
            var movie = JSON.parse(body);
            console.log(`Title: ${movie['Title']}`);
            console.log(`Year: ${movie['Year']}`);
            console.log(`IMDB Rating: ${movie['imdbRating']}`);
            console.log(`Rotten Tomatoes: ${movie['Ratings'].find(function(r) {
                return r.Source === 'Rotten Tomatoes'
            }).Value}`);
            console.log(`Country: ${movie['Country']}`);
            console.log(`Language: ${movie['Language']}`);
            console.log(`Plot: ${movie['Plot']}`);
            console.log(`Actors: ${movie['Actors']}`);
        }
    })
};

function doWhatItSays() {
    fs.readFile('./random.txt', 'utf8', function(err, contents) {
        if (err) {
            return console.log('Error occurred: ' + err);
        } else {
            var command = contents.slice(0,contents.indexOf(','));
            var params = contents.slice(contents.indexOf(',') + 1);
            params = params.replace(/"/g, '').split(" ");
            switch(command) {
                case 'my-tweets':
                    console.log('Will show last 20 tweets');
                    collectTweets(params);
                    break;
                case 'spotify-this-song':
                    console.log('Will show song info');
                    returnSong(params);
                    break;
                case 'movie-this':
                    console.log('Will show movie info')
                    returnMovie(params);
                    break;
                default: 
                    console.log("I'm sorry, I didn't get that")
        };
        };
    })
}

