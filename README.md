# Lab-Partner
Slack bot for interactive automated workshop support

## Configuration

**Environment Variables**
- **CLIENT_SIGNING_SECRET**: Slack app signing secret 
    
    This value is generated when you create a Slack app. [api.slack.com/app](api.slack.com/app) _Basic Information_ -> _App Credentials_ -> _Signing Secret_.
- **BOT_TOKEN**: Slack app bot user OAuth token
    
    This value is generated when you create a Slack app. [api.slack.com/app](api.slack.com/app) _OAuth & Permissions_ -> _Tokens for Your Workspace_ -> _Bot User OAuth Access Token_.
- **TEAM**: Slack workspace ID

- **MONGO_URI**: URL of Mongo DB server.

- **SCRIPT**: Relative path to _Script_ folder.

### Kubernetes Secret Configuration
    If you're deploying to kubernetes this application has a helm chart which includes a secret named `lab-partner`. You'll need to set the three following strings in the values.yaml for this secret to be populated.

```
secrets:
  slackSigningSecret: ""
  slackBotUserOauthAccessToken: ""
  teamId: ""
```

## Scripts

_Scripts_ represent the customized functionality for a specific workshop or lab. They tell the bot how to respond to user input or other events, how to track participant progress, etc. A _Script_ is simply a folder with BotKit features. Each feature is a JavaScript modules which return a function which takes the BotKit controller as an argument.

```javascript
module.exports = function (controller) {
  // Code to extend bot functionality goes here :)
}
```

There is a sample _Script_ in the [sample-script](./sample-script) folder.

To use a _Script_ the **SCRIPT** environment variable must be set to a relative path to the _Script_ folder.

## Plugins

### Help

Provides access to the build in help message.

**help.addCommand(command, name, description)**

Adds a command to the built in help message. Should be used by _Script_ features to document additional commands available to the participant.

- **command**: sample message that will trigger the feature
- **name**: name of the feature
- **description**: description of what the feature does

```javascript
module.exports = async (controller) => {

  controller.plugins.help.addCommand("@lab-partner awesome feature", "Awesome Feature", "This feature is so awesome!");

  controller.hears("awesome feature", "mention", (bot, message) => {
    bot.reply(message, "This feature is awesome!");
  }
}
```

**help.getMessage()**

Returns a Slack message to display a help message with available commands. The message is returned as an object with a list of [Slack block kit](https://api.slack.com/block-kit) blocks.

```javascript
module.exports = async (controller) => {

  controller.hears("foo", "mention", (bot, message) => {
    const helpMessage = controller.plugins.help.getMessage();

    bot.reply(message, {
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            test: "I don't know what you mean by \"foo\". Try one of these commands..."
          },
        },
        ...helpMessage.blocks,
      ],
    });
  }
}
```

### Slack helper

**slack.whoAmI()**

Fetches Slack [user info](https://api.slack.com/methods/users.info) for the bot.

```javascript
module.exports = async (controller) => {

  let botUser;
  try {
    botUser = await controller.slack.whoAmi();
  } catch (error) {
    console.error(`Failed to fetch bot user info: ${error}`);
    return;
  }
  console.log(`Bot user name is ${botUser.real_name}.`);
}
```

**slack.getUserInfo(id)**

Fetches Slack [user info](https://api.slack.com/methods/users.info) for a user.

- **id**: Slack user id

```javascript
module.exports = async (controller) => {

  controller.hears("what is my status", "message", (bot, message) => {
    
    const userInfo = controller.plugins.slack.getUserInfo(message.user);

    bot.reply(message, {
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            test: `Your status is ${userInfo.profile.status_emoji}: ${userInfo.profile.status_text}`,
          },
        },
        ...helpMessage.blocks,
      ],
    });
  }
}
```
