const axios = require('axios');
var _ = require('lodash');
import PosthookApi from './postHookApi'

export default class DevtoHandler {
    constructor() {
        this.postHookApi = new PosthookApi()
        this.devToHeaders = {
            headers: {
                'api-key': 'atBREPvEPrsWPDEZf8AHMrVm',
                'Content-Type': 'application/json'
            }
        }
    }

    async schedulePublish(url, date) {
        const unpublishedArticles = await this.getUnpublishedArticles()
        const article = _.find(unpublishedArticles, { 'canonical_url': url})
        if(_.isEmpty(article)) {
            console.log('Unable to find unpublished article')
            return {success: false}
        }

        const canonicalUrl = article.canonical_url
        const id = article.id
        console.log('Got canonical url:' + canonicalUrl+ ' and id: ' + id)

        const hooks = await this.postHookApi.getHooks()
        
        await Promise.all(hooks.data.map(async (hook) => {
            console.log(hook)
            if(id == hook.data.articleId) {
                console.log('Article hook is scheduled. Going to delete older hook')
                await this.postHookApi.deleteHook(hook)
            }
        }))

        await this.postHookApi.scheduleHook({
            articleId: id,
            canonicalUrl: canonicalUrl 
        }, date)
        return {success: true}
    }

    async handlePublish(payload) {
        console.log(payload)
    }

    async publishArticle(url) {
        const unpublishedArticles = await this.getUnpublishedArticles()
        const article = _.find(unpublishedArticles, { 'canonical_url': url})
        if(_.isEmpty(article)) {
            console.log('Unable to find unpublished article')
            return {success: false}
        }

        const canonicalUrl = article.canonical_url
        const id = article.id
        console.log('Got canonical url:' + canonicalUrl+ ' and id: ' + id)
        let requestBody = {
            published: true
        };
        // const publishArticleRes = await axios.put('https://dev.to/api/articles/'+id, requestBody, this.devToHeaders)
        // console.log(publishArticleRes.data)
        // return publishArticleRes.data
        return {success: 'OK'}
    }

    async getUnpublishedArticles() {
        console.log('Going to get unpublished articles')
        const getArticleRes = await axios.get('https://dev.to/api/articles/me/unpublished', this.devToHeaders)
        // console.log(getArticleRes.data)
        return getArticleRes.data
    }
}