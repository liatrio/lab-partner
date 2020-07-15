module.exports = async (controller) => {
    console.log("Enabling feature: Help");

    controller.hears(
        ["stop"],
        ["message", "direct_message", "direct_mention", "mention"],
        async (bot, message) => {
            console.log("Script kubernetes.js: stop triggered");
            controller.plugins.kubernetes.stopWatch();

            await bot.reply(message, {
                blocks: [
                    {
                        type: "section",
                        text: {
                            type: "mrkdwn",
                            text: "Howdy :wave:",
                        },
                    },
                ],
            });
        }
    );
};
