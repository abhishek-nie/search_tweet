const Twitter = require('twitter');
require('dotenv').config();
module.exports = (app, io) => {
    let twitter = new Twitter({
        // consumer_key: process.env.TWITTER_API_KEY,
        // consumer_secret: process.env.TWITTER_API_SECRET,
        // access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
        // access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
        consumer_key: 'uCgvE1AsTpwhdFJQMqOfpZ4I7',
        consumer_secret: 'tWwP0iZi1QYMgYdtZVOSWieb0tDoTKUB4ETCT93VC9C0hGThmg',
        access_token_key: '1250047066715258887-xtlhGayxXyDNSTzznYLiMsgh8AqQ4v',
        access_token_secret: 'x8IyeQzKTFKwddWJX9cJ9oKi1nJJ3u5gUWnCYsAAqjLAw',
        bearer_token: 'AAAAAAAAAAAAAAAAAAAAAHu3XwEAAAAA%2BoJ5WnG398RHQSdTRU9uDC%2FIass%3DKG5JP8GdQXg8Pew5DgVawVCl3yPwefBE8F60QbYMuMj9Ai6Hyb'
    });
    let socketConnection;
    let twitterStream;
//console.log(process.env)
//console.log(app)
    app.locals.searchTerm = 'Elon'; //Default search term for twitter stream.
    app.locals.showRetweets = false; //Default
    /**
     * Resumes twitter stream.
     */
    const stream = () => {
        console.log('Resuming for ' + app.locals.searchTerm);
        twitter.stream('statuses/filter', { track: app.locals.searchTerm }, (stream) => {
            stream.on('data', (tweet) => {
                sendMessage(tweet);
            });

            stream.on('error', (error) => {
                console.log(error);
            });

            twitterStream = stream;
        });
    }

    /**
     * Sets search term for twitter stream.
     */
    app.post('/setSearchTerm', (req, res) => {
        let term = req.body.term;
        app.locals.searchTerm = term;
        twitterStream.destroy();
        stream();
    });

    //Establishes socket connection.
    io.on("connection", socket => {
        console.log('connection starting')
        socketConnection = socket;
        stream();
        socket.on("connection", () => console.log("Client connected"));
        socket.on("disconnect", () => console.log("Client disconnected"));
    });

    /**
     * Emits data from stream.
     * @param {String} msg 
     */
    const sendMessage = (msg) => {
        if (msg.text.includes('RT')) {
            return;
        }
        socketConnection.emit("tweets", msg);
    }
};
