const axios = require('axios')

module.exports.view = (payload, res) => {

    callback_id = payload.callback_id
    
    if(callback_id === 'slack_gitlab_create_issue') {
        response_url = payload.response_url
        text = payload.message.text
        trigger_id = payload.trigger_id

        axios.post('https://slack.com/api/views.open', {
            "trigger_id": trigger_id,
            "view": {
            "type": "modal",
            "title": {
                "type": "plain_text",
                "text": "Create Gitlab Issue"
            },
            "blocks": [
                {
                    "type": "input",
                    "label": {
                        "type": "plain_text",
                        "text": "Issue Title"
                    },
                    "element": {
                        "type": "plain_text_input",
                        "action_id": "issue_title_input",
                        "placeholder": {
                            "type": "plain_text",
                            "text": "Input the title for the issue here"
                        },
                        "multiline": false
                    }, 
                    "optional": false
                },
                {
                    "type": "input",
                    "label": {
                        "type": "plain_text",
                        "text": "Issue Description"
                    },
                    "element": {
                        "type": "plain_text_input",
                        "action_id": "issue_description_input",
                        "initial_value": text,
                        "placeholder": {
                            "type": "plain_text",
                            "text": "Input a detailed description of the issue"
                        },
                        "multiline": true
                    }, 
                    "optional": false
                }
            ],
            "close": {
                "type": "plain_text",
                "text": "Cancel"
            },
            "submit": {
                "type": "plain_text",
                "text": "Save"
            },
            "private_metadata": "Shhh",
            "callback_id": callback_id
        }
          }, {
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': 'Bearer ' + process.env.SLACK_BOT_TOKEN
            }
        }).then((res) => {
            console.log("Got response")
            console.log(JSON.stringify(res.data))
        }).catch((error) => {
            console.error(error)
        })
        console.log(response_url)
    }
}