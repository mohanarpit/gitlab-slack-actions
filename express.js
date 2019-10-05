const dialog = require('./slack-api.js')
const express = require('express')
const bodyParser = require('body-parser')
const gitlabApi = require('./gitlab-api.js')
const app = express()
const port = 3000

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
             response = await dialog.view(payload, res)
            break
        case "view_submission":
            response = await dialog.submit(payload, res)
            break
        
    }
    console.log("Going to send response: " + JSON.stringify(response))
    res.type("application/json; charset=utf-8")
    res.send(JSON.stringify(response))
});

app.listen(port, async () => {
    console.log(`Example app listening on port ${port}!`)
})