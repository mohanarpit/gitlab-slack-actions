const dialog = require('./slack-api.js')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/slack/events', (req, res) => {
    console.log(req.body)
    body = req.body
    if(body.type === 'url_verification') {
        const challenge = body.challenge
        console.log("Got challenge: " + challenge)
        res.type('text/plain')
        res.send(challenge)
    }
})

app.post('/slack/interactions', (req, res) => {
    
    console.log(req.body.payload)
    payload = JSON.parse(req.body.payload)
    dialog.view(payload, res)
    res.send('OK!')
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))