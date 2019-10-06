const gitlabApi = require('./gitlabHandler')
const { WebClient } = require('@slack/web-api');
import DevtoHandler from './devtoHandler'

var _ = require('lodash');

export default class SlackHandler {
    constructor(){
        this.slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);
        this.devtoHandler = new DevtoHandler()
    }

    async view(payload) {
        const callback_id = payload.callback_id
        
        if(callback_id != 'slack_gitlab_create_issue') {
            return {error_msg: "Invalid callback_id"}
        }
    
        let text = payload.message.text
        const trigger_id = payload.trigger_id
        let result = {success: false}
        if(!_.isEmpty(payload.message.files)) {
            let count = 0
            text += '\n\nAttachments:'
            _.forEach(payload.message.files, function(file) {
                console.log("Got file obj: " + JSON.stringify(file))
                count++
                const fileUrl = file.permalink
                text += `\n\n${fileUrl}`
            })
        }
        try {
            result = await this.slackClient.views.open({
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
        } catch(error) {
            console.error(JSON.stringify(error))
        }
        return result
    }

    async submit(payload) {
        const callback_id = payload.view.callback_id
        
        if(callback_id != 'slack_gitlab_create_issue') {
            console.log("got callback_id")
            return {error_msg: "Invalid callback_id"}
        }
        const state_values = payload.view.state.values
    
        const gitlabResponse = await gitlabApi.create_issue(state_values.issue_title.issue_title_input.value, 
            state_values.issue_desc.issue_description_input.value)
    
        var response = {success: false}
        try {
            response = await this.slackClient.views.update({
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
                            text: 'Thanks for reporting a bug! \n\nSuccessfully created Gitlab Issue #' + gitlabResponse.iid + '. Ignore the error above if you see an issue number.'
                          }
                        },
                        {
                            "type": "image",
                            "title": {
                                "type": "plain_text",
                                "text": "Rejoice in your contribution to the project",
                                "emoji": true
                            },
                            "image_url": "https://images.unsplash.com/photo-1454486837617-ce8e1ba5ebfe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2252&q=80",
                            "alt_text": "Celebration image"
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

    async slashCommand(payload) {
        console.log(payload)
        const text = payload.text
        const textArray = _.split(text, ' ')
        switch(_.toLower(textArray[0])) {
            case 'devto':
            case 'dev.to':
                // Sample command: devto publish <link> at <datetime>
                console.log("Got the devto command")
                if(_.toLower(textArray[1]) === 'publish') {
                    console.log('Going to schedule devto publish')
                    // TODO: Get the date via interactivity message
                    await this.devtoHandler.schedulePublish(textArray[2], textArray[4])
                }
                break
            default:
                console.log('Invalid match')
        }

        return {
            "text": "Successfully scheduled article for publishing",
            "attachments": [
                {
                    "text":"Please check the Dev.to dashboard for canonical url"
                }
            ]
        }
    }

}