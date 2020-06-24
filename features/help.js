module.exports = async (controller) => {
    console.log("Enabling feature: Help");

    const botUser = await controller.plugins.slack.whoAmI();

    controller.plugins.help.addCommand(
        `@${botUser.real_name} help`,
        ":question: Help",
        "Display this help message"
    );

    controller.hears(
        ["help"],
        ["message", "direct_message", "direct_mention", "mention"],
        async (bot, message) => {
            const helpMessage = controller.plugins.help.getMessage();
            console.log("Script help.js: Help triggered");
            await bot.reply(message, {
                blocks: [
                    {
                        type: "section",
                        text: {
                            type: "mrkdwn",
                            text: "Howdy :wave:",
                        },
                    },
                    ...helpMessage.blocks,
                ],
            });
        }
    );
};
