const { TwitterApi } = require('twitter-api-v2')
const prompts = require('prompts')
const querystring = require('querystring')

const log = message => console.log('\x1b[1m' + message)
const error = message => console.error('\x1b[31m' + message)
const prompt = async message => (await prompts({ type: 'text', name: 'value', message }))['value']

;(async () => {
    log('1. Provide application keys.')
    const consumerKey = await prompt('Consumer Key')
    const consumerSecret = await prompt('Consumer Secret')
    const client = new TwitterApi({ appKey: consumerKey, appSecret: consumerSecret })

    log('')
    const callbackUrl = await prompt('2. Provide callback URL')
    const authLink = await client.generateAuthLink(callbackUrl)

    log(`\n3. Complete the auth by the link: ${authLink.url}`)

    log('')
    const redirectedUrl = await prompt('4. Provide full URL you were redirected to')
    const query = querystring.parse(redirectedUrl.split('?')[1])

    const { oauth_token, oauth_verifier } = query
    const { oauth_token_secret } = authLink

    if (!oauth_token || !oauth_verifier || !oauth_token_secret)
        return error('ERROR: You provided the wrong URL or denied the app.')

    const userClient = new TwitterApi({
        appKey: consumerKey,
        appSecret: consumerSecret,
        accessToken: oauth_token,
        accessSecret: oauth_token_secret
    })

    userClient.login(oauth_verifier)
        .then(({ accessToken, accessSecret }) => {
            log('\nSuccessfully generated persistent tokens:')
            log(`Access Token: ${accessToken}`)
            log(`Access Secret: ${accessSecret}`)
        })
        .catch(() => error('ERROR: Invalid verifier or access tokens.'))
})()
