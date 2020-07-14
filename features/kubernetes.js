module.exports = async (controller) => {
    console.log("Enabling feature: Help");

    controller.hears(
        ["kubernetes"],
        ["message", "direct_message", "direct_mention", "mention"],
        async (bot, message) => {
            const podResponse = await controller.plugins.kubernetes.watchForEvents(
                "default",
                (type, event) => {
                    console.log(type, event);
                }
            );
            console.log(podResponse);
            console.log("Script kubernetes.js: kubernetes triggered");
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
