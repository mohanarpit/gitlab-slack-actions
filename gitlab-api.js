import { Gitlab } from 'gitlab';

const api = new Gitlab({
    token: process.env.GITLAB_TOKEN,
});
const projectId = process.env.GITLAB_PROJECT_ID

module.exports.create_issue = async(title, desc) => {
    console.log("Going to create gitlab issue")
    const opts = {
        'title': title,
        'description': desc
    }
    return await api.Issues.create(projectId, opts)
}