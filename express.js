const dialog = require('./slack-api.js')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = process.env.PORT || 3000

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/slack/events', (req, res) => {
    console.log(req.body)
    const body = req.body
    if(body.type === 'url_verification') {
        const challenge = body.challenge
        console.log("Got challenge: " + challenge)
        res.type('text/plain')
        res.send(challenge)
    }
})

app.post('/slack/interactions', async (req, res) => {
    console.log(req.body.payload)
    const payload = JSON.parse(req.body.payload)
    const type = payload.type
    var response = ""
    switch(type) {
        case "message_action": 
            console.log("Going to process new view msg")
            response = await dialog.view_new(payload)
            break
        case "view_submission":
            console.log("Going to process view submission")
            response = await dialog.submit_new(payload, res)
            break
    }
    console.log("Going to send response to Slack: " + JSON.stringify(response))
    res.type("application/json; charset=utf-8")
    res.send(JSON.stringify(response))
});

app.listen(port, async () => {
    console.log(`Gitlab Slack Actions app listening on port ${port}!`)
})