# HTTP Status Cats Bot for Slack
> :sparkles: *Updated September 2018* 
>
> This is a revised version of my 2-year-old article. 
>
> Since I wrote the original tutorial two years ago, there have been a lot of changes-- first, I am now a Slack employee (nice, right?) also, Slack Platform team has made significant upgrade with the API by introducing a lot of new features including new OAuth token model and security features. I re-wrote the tutorial to hopefully help developers who previously have worked with Slack APIs and want to update your apps with the new features, as well as a new Slack!
>
> All the changes from the previous version of this example, read the [diff.md](diff.md)*
>
> *Learn more about the workspace app at the [Slack API doc](https://api.slack.com/workspace-apps-preview).*

---

This is a tutorial for a simple slash command to look up the definition of http status code on Slack. The app lets a user to type `/httpstatus` slash command to view a short description of each status code with the [HTTP Status Cats](https://http.cat/) picture :cat:, as well as showing how to configure the OAuth button for distributing your app to public.

![HTTP Status Cats for Slack](https://github.com/girliemac/slack-httpstatuscats/blob/master/public/images/slack-httpstatuscats.gif)


## Try the demo

Authenticate from this button!

[![Login with Slack](https://platform.slack-edge.com/img/add_to_slack@2x.png)](https://slack.com/oauth/authorize?scope=commands+team%3Aread&client_id=54308870179.89146186500)

---

## Build your own - Developer setup

### Create a Slack app

1. Create a *workspace app* at [https://api.slack.com/apps?new_app_token=1](https://api.slack.com/apps?new_app_token=1)
2. Add a Slash command (See *Add a Slash Command* section below)
3. Navigate to the **OAuth & Permissions** page, scroll down to **Scopes** section, and make sure the `commands` scope is added.
4. Go to **Install Apps** and intall the app to the selected workspace. (You should get an OAuth access token after the installation)
5. In the mean time, go to **Basic Information** to set up your app info and get your credentials. (You will need the credentials to run the app. See the *Run the app locally* below.)

#### Add a Slash Command
1. Go back to the app settings and click on Slash Commands.
2. Click the 'Create New Command' button and fill in the following:
    * Command: `/httpstatus`
    * Request URL: Your ngrok or Glitch URL + /commands
    * Short description: `Display HTTP status code with cats`
    * Usage hint: `404`
3. Save 

### Run the app locally 
1. Get the code
    * Clone this repo and run `npm install`
2. Set the following environment variables to `.env` (see `.env.sample`):

    * `SLACK_SIGNING_SECRET`: Your app's Signing Secret (available on the **Basic Information** page)
    * `SLACK_CLIENT_ID`: You need this only when you distribute your app. (available on the **Basic Information** page)
    * `SLACK_CLIENT_SECRET`: You need this only when you distribute your app. (available on the **Basic Information** page)
3. If you're running the app locally, run the app (`npm start`)

## Tutorial on Medium

TBA

---

## About HTTP Status Cats

Internet is made of cats, so why not HTTP Status codes, explained with cats?

Originally, HTTP Status Cats was created by yours truly, **me** in 2011!
It is best described on [Know Your Meme](http://knowyourmeme.com/memes/http-status-cats).

I would never imagined I had such a 10-min fame at that time I created and posted the cat pics on [Flickr](https://www.flickr.com/photos/girliemac/sets/72157628409467125/). I was immediately featured on Boing Boing, Mashables, CNN Tech, BuzzFeed, and many more including international tech news etc. Especially, I loved that [Boing Boing](http://boingboing.net/2011/12/14/http-status-cats-by-girliemac.html) said I "just won the internet".

A good time.

HTTP Status Cats are later well-adopted by communities, and evolved into many APIs and apps, especially HTTP Status Cats API and its awesome domain, **http.cat** by [Rogério Vicente](https://twitter.com/rogeriopvl). The page is also available in Catalan language, as its TLD shows!

---


