const gitlabApi = require('./gitlab-api')
const { WebClient } = require('@slack/web-api');

const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

module.exports.view_new = async (payload) => {
    const callback_id = payload.callback_id
    
    if(callback_id != 'slack_gitlab_create_issue') {
        return {error_msg: "Invalid callback_id"}
    }

    const text = payload.message.text
    const trigger_id = payload.trigger_id

    const result = await slackClient.views.open({
        trigger_id: trigger_id,
        view: {
            type: "modal",
            title: {
                type: "plain_text",
                text: "Create Gitlab Issue"
            },
            blocks: [
                {
                    type: "input",
                    block_id: "issue_title",
                    label: {
                        type: "plain_text",
                        text: "Issue Title"
                    },
                    element: {
                        type: "plain_text_input",
                        action_id: "issue_title_input",
                        placeholder: {
                            type: "plain_text",
                            text: "Input the title for the issue here"
                        },
                        multiline: false
                    }, 
                    optional: false
                },
                {
                    type: "input",
                    block_id: "issue_desc",
                    label: {
                        type: "plain_text",
                        text: "Issue Description"
                    },
                    element: {
                        type: "plain_text_input",
                        action_id: "issue_description_input",
                        initial_value: text,
                        placeholder: {
                            type: "plain_text",
                            text: "Input a detailed description of the issue"
                        },
                        multiline: true
                    }, 
                    optional: false
                }
            ],
            close: {
                type: "plain_text",
                text: "Cancel"
            },
            submit: {
                type: "plain_text",
                text: "Save"
            },
            private_metadata: "Shhh",
            callback_id: callback_id
        }
    })
    return result
}

module.exports.submit_new = async (payload, res) => {
    const callback_id = payload.view.callback_id
    
    if(callback_id != 'slack_gitlab_create_issue') {
        console.log("got callback_id")
        return {error_msg: "Invalid callback_id"}
    }
    const state_values = payload.view.state.values

    const gitlabResponse = await gitlabApi.create_issue(state_values.issue_title.issue_title_input.value, 
        state_values.issue_desc.issue_description_input.value)

    var response = ""
    try {
        response = await slackClient.views.update({
            view_id: payload.view.id,
            view: {
                type: 'modal',
                callback_id: callback_id,
                title: {
                    type: 'plain_text',
                    text: 'Gitlab Issue Created',
                },
                blocks: [
                    {
                      type: 'section',
                      text: {
                        type: 'plain_text',
                        text: 'Successfully created Gitlab Issue #' + gitlabResponse.iid + '. Ignore the error above if you see an issue number.'
                      }
                    }
                ],
                close: {
                    type: "plain_text",
                    text: "Close"
                }
            }
        })
        console.log("Got view update response")
        console.log(response)
    } catch(error) {
        console.log("Caught error")
        console.log(JSON.stringify(error))
    }
    return {success: "OK"}
}