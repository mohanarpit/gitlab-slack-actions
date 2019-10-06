const axios = require('axios');
var _ = require('lodash');

export default class DevtoHandler {
    constructor() {
        this.headers = {
            headers: {
                'api-key': 'atBREPvEPrsWPDEZf8AHMrVm',
                'Content-Type': 'application/json'
            }
        }
    }

    async publishArticle(url) {
        const unpublishedArticles = await this.getUnpublishedArticles()
        const article = _.find(unpublishedArticles, { 'canonical_url': url})
        const canonicalUrl = article.canonical_url
        const id = article.id
        console.log('Got canonical url:' + canonicalUrl+ ' and id: ' + id)
        let requestBody = {
            published: true
        };
        const publishArticleRes = await axios.put('https://dev.to/api/articles/'+id, requestBody, this.headers)
        console.log(publishArticleRes.data)
        return publishArticleRes.data
        // return {success: 'OK'}
    }

    async getUnpublishedArticles() {
        console.log('Going to get unpublished articles')
        const getArticleRes = await axios.get('https://dev.to/api/articles/me/unpublished', this.headers)
        console.log(getArticleRes.data)
        return getArticleRes.data
    }
}