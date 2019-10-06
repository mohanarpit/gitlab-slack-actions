const axios = require('axios');
var _ = require('lodash');

export default class PosthookApi {
    constructor() {
        this.postHookHeaders = {
            headers: {
                'X-API-Key': process.env.POSTHOOK_KEY,
                'Content-Type': 'application/json'
            }
        }
    }

    async deleteHook(hook) {
        console.log('Going to delete hook id: ' +hook.id)
        const delHookRes = await axios.delete('https://api.posthook.io/v1/hooks/' + hook.id, this.postHookHeaders)
        console.log(delHookRes.data)
        return delHookRes.data
    }

    async getHooks() {
        const getHooksResponse = await axios.get('https://api.posthook.io/v1/hooks?status=pending', this.postHookHeaders)
        return getHooksResponse.data
    }

    async scheduleHook(data, when) {
        console.log('Going to schedule hook for: ' + when)
        const now = new Date(when)
        console.log(now.toISOString())

        const scheduleReq = {
            path: '/devto/publish',
            postAt: now.toISOString(),
            data: data
        }
        const postHookResponse = await axios.post('https://api.posthook.io/v1/hooks', scheduleReq, this.postHookHeaders)
        console.log(postHookResponse.data)
    }
}