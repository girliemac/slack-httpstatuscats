# What's New? - Updates from the Previous Example


## Sigining Secret 

*This requires to update your code!*

Previously, you needed to verify a *verificatin token* to see if a request was coming from Slack, not from some malicious place by simply comparing a string with the legacy token with a token received with a payload. But now you must use more secure *sigining secrets*.

Basically, you need to compare the value of the `X-Slack-Signature`, the HMAC-SHA256 keyed hash of the raw request payload, with a hashed string containing your Slack signin secret code, combined with the version and `X-Slack-Request-Timestamp`. 

Learn more at [Verifying requests from Slack](https://api.slack.com/docs/verifying-requests-from-slack).

## Distributing your App - User login with OAuth button

When a new user (admin) install your app to their workspace, you still need to exchange a temporary `code` values for tokens using `oauth.access` for the initial OAuth handshake, just like traditional Slack apps, however, there is a new response structure that includes extra info. 

Learn more at [Changes to the OAuth flow for workspace token preview apps](https://api.slack.com/changelog/2018-04-oauth-flow-changes-for-workspace-token-preview-apps)

## OAuth Token

Workspace apps have totally different token types - 

Previously, there are user token (`xoxp-`) and bot token (`xoxb-`). The new app has no concept of the user/bot separations and just have an access token.

Workspace app access tokens (`xoxa-`) can be either long-lived token and short-lived token. You can use the long-lived token to run your app internally on your team's workspace, however, if you distribute your app, you must use the short-lived token that expires every 60 min. See the *Token Rotation* section below.

## Token Rotation

OAuth refresh tokens are also introduced as a security feature, which allows the app owners to proactively rotate tokens when the tokens are compromised.

Once you enable the *Token Expiration* at your OAuth setting from the app configuration page, you get a refresh token that begins with `xoxr-`. Either use this token on the page (for development or an internal integration), or OAuth user authorization (if your app is distributed) to get a new access token using `oauth.access` method every time you need one. 

As you may have notices, now you call `oauth.access` method in two different scenarios:
1. The initial handshake to receive a temporary authorization code during the OAuth flow
2. To gain a new access token, passing the refresh token as argument and `grant_type=refresh_token` as a parameter

Also, you can use the new `apps.uninstall` method to uninstall itself from a single workspace, revoking all tokens associated with it. To revoke a workspace token without uninstalling the app, use `auth.revoke`.

To lean more, read [Token rotation for workspace apps](https://api.slack.com/docs/rotating-and-refreshing-credentials).


:gift: I created this tutorial for everybody by not using a SDK, however,  
if you are using the [Node SDK](https://github.com/slackapi/node-slack-sdk/issues/617), ot [Python SDK](https://github.com/slackapi/python-slackclient), the token refresh feature is available for you already!
