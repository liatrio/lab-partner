module.exports = async function (controller) {
    let watch;

    const botUser = await controller.plugins.slack.whoAmI();

    controller.plugins.help.addCommand(
        `@${botUser.real_name} watch <resources>`,
        ":eyes: Start Watch",
        "Watch a specific Kubernetes resource"
    );
    controller.plugins.help.addCommand(
        `@${botUser.real_name} stop watch`,
        ":eyes: Stop Watch",
        "Kill existing watch on Kubernetes resource"
    );

    controller.hears(
        new RegExp(/((watch) [a-zA-Z]*$)/),
        "direct_mention",
        async (bot, message) => {
            var trimmedMessage = message.text.replace("watch ", "");
            if (watch != undefined) {
                console.log("Watch has already been started!");

                await bot.reply(message, {
                    blocks: [
                        {
                            type: "section",
                            text: {
                                type: "mrkdwn",
                                text:
                                    "Uh oh! You already have started a watch!",
                            },
                        },
                    ],
                });
                return;
            }

            if (
                !controller.plugins.kubernetes
                    .getK8s()
                    .api.v1.children.includes(trimmedMessage)
            ) {
                console.log("That is not a valid resource type!");

                await bot.reply(message, {
                    blocks: [
                        {
                            type: "section",
                            text: {
                                type: "mrkdwn",
                                text:
                                    "Uh oh! That is not a valid resource type! Try another(ex: pods)",
                            },
                        },
                    ],
                });
                return;
            }

            await bot.reply(message, {
                blocks: [
                    {
                        type: "section",
                        text: {
                            type: "mrkdwn",
                            text: `Kubernetes watch running on ${trimmedMessage}!`,
                        },
                    },
                ],
            });

            const kubeResource = {
                type: trimmedMessage,
                resource: "",
                group: "",
            };
            watch = controller.plugins.kubernetes.newWatch(
                (type, object) => {
                    let text = `New Resource ${object.metadata.name} was ${type}`;
                    bot.api.chat.postMessage({
                        text: text,
                        channel: message.channel,
                    });
                },
                kubeResource,
                "default",
            );
            await watch.start();
        }
    );

    controller.hears(
        [/stop watch$/],
        "direct_mention",
        async (bot, message) => {
            console.log("Script kubernetes.js: Stopping watch");

            if (watch === undefined) {
                console.log("No watch has been started!");
                await bot.reply(message, {
                    blocks: [
                        {
                            type: "section",
                            text: {
                                type: "mrkdwn",
                                text: "Can't stop what I haven't started!",
                            },
                        },
                    ],
                });
            } else {
                await watch.stop();
                await bot.reply(message, {
                    blocks: [
                        {
                            type: "section",
                            text: {
                                type: "mrkdwn",
                                text: "Watch is being stopped...",
                            },
                        },
                    ],
                });
                watch = undefined;
            }
        }
    );
};
