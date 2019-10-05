import { Gitlab } from 'gitlab';

const api = new Gitlab({
    host: 'https://gitlab.com',
    token: process.env.GITLAB_TOKEN,
});

module.exports.list_issues = async() => {
    const all_issues = api.Issues.all()
    console.log(all_issues)
}

module.exports.create_issue = async (req, res) => {

}