// const { SlackDialog } = require("botbuilder-adapter-slack");
const { /* BotWorker, */ BotkitConversation } = require("botkit");

module.exports = function (controller) {
    controller.on("channel_join", async (bot, message) => {
        console.log("CHANNEL JOINED", message);

        if (message.user !== message.incoming_message.recipient.id) {
            return;
        }

        let inviter = await controller.plugins.slack.getUserInfo(
            message.inviter,
            bot
        );
        // bot.reply(message, `Thanks for the invite ${inviter.profile.display_name}`);

        const convo = new BotkitConversation(message.event_ts, controller);
        convo.say(`Thanks for the invite ${inviter.profile.display_name}`);
        convo.ask(
            "What is your GitHub username?",
            async (response /*, convo, bot */) => {
                console.log("RESPONSE", response);
            },
            "github_name"
        );

        controller.addDialog(convo);
    });
};
