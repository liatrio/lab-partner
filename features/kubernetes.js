module.exports = async (controller) => {
    console.log("Enabling feature: Help");

    controller.hears(
        ["kubernetes"],
        ["message", "direct_message", "direct_mention", "mention"],
        async (bot, message) => {
            const kubeResource = {
                type: "event",
                resource: "",
                group: "",
            };
            controller.plugins.kubernetes.startWatch(
                kubeResource,
                "default",
                () => {
                    console.log("Event detected");
                }
            );

            console.log("Script kubernetes.js: kubernetes triggered");
            setTimeout(() => console.log("Waited 5 secs..."), 5000);
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
