const axios = require('axios')

module.exports.view = async (payload, res) => {

    callback_id = payload.callback_id
    
    if(callback_id != 'slack_gitlab_create_issue') {
        return {error_msg: "Invalid callback_id"}
    }

    response_url = payload.response_url
    text = payload.message.text
    trigger_id = payload.trigger_id

    let response = await axios.post('https://slack.com/api/views.open', {
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
                "block_id": "issue_title",
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
                "block_id": "issue_desc",
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
        return error
    })
    return {"success": "OK"}
}

module.exports.submit = async (payload, res) => {
    console.log("*** In the submit")
    callback_id = payload.view.callback_id
    
    if(callback_id != 'slack_gitlab_create_issue') {
        console.log("got callback_id")
        return {error_msg: "Invalid callback_id"}
    }

    response_url = payload.response_url
    trigger_id = payload.trigger_id
    console.log("Got view_id: " + payload.view.id)

    const res_body = {
        "response_action": "update",
        "trigger_id": trigger_id,
        "view_id": payload.view.id,
        "view": {
            "type": "modal",
            "title": {
                "type": "plain_text",
                "text": "Gitlab Issue Created"
            },
            "blocks": [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "Let's get this fixed!"
                    },
                    "accessory": {
                        "type": "image",
                        // "image_url": "https://gph.is/2ql3mRt",
                        "image_url": "https://www.pblworks.org/sites/default/files/inline-images/celebration.jpg",
                        "alt_text": "celebration"
                    }
                }
            ],
            "close": {
                "type": "plain_text",
                "text": "Close"
            },
            "callback_id": callback_id
        }
    }
    // return res_body
    console.log("**** Going to update view with body: ")
    console.log(res_body)
    // TODO: This is still returning an error even though it's successfully updating the message. 
    // Maybe DM the user with the status?
    let response = await axios.post('https://slack.com/api/views.update', res_body, {
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': 'Bearer ' + process.env.SLACK_BOT_TOKEN
        }
    }).then((res) => {
        console.log("Got response")
        console.log(JSON.stringify(res.data))
        return "OK"
    }).catch((error) => {
        console.error(error)
        return error
    })
    return response

}