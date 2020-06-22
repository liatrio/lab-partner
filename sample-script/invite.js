module.exports = function (controller) {
    controller.on("channel_join", async (bot, message) => {
        console.log("Script invite.js: Channel join triggered");

        if (message.user !== message.incoming_message.recipient.id) {
            return;
        }

        await bot.startConversationInChannel(message.channel, message.user);
        const helpMessage = controller.plugins.help.getMessage();
        await bot.say({
            blocks: [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `Howdy :face_with_cowboy_hat: Thanks for the invite <@${message.inviter}>`,
                    }
                },
                ...helpMessage.blocks,
            ]
        });
    });
};
