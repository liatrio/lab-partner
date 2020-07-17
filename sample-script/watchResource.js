const { BotkitConversation } = require("botkit");

module.exports = function (controller) {
    let stop;

    controller.hears(new RegExp(/((watch)$)|((watch) [a-zA-Z]*$)/), "direct_mention", async (bot, message) => {
        var trimmedMessage = message.text.replace("watch ", "");
        if (stop != undefined) {
            console.log("Watch has already been started!");

            await bot.reply(message, {
                blocks: [
                    {
                        type: "section",
                        text: {
                            type: "mrkdwn",
                            text: "Uh oh! You already have started a watch!",
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
        stop = controller.plugins.kubernetes.startWatch(
            kubeResource,
            "default",
            (type, object) => {
                let text = `New Resource ${object.metadata.name} was ${type}`;
                bot.api.chat.postMessage({
                    text: text,
                    channel: message.channel
                });
            }
        );
    });

    controller.hears([/^stop$/], "direct_mention", async (bot, message) => {
        console.log("Script kubernetes.js: Stopping watch");

        if (stop === undefined) {
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
            stop();
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
            stop = undefined;
        }
    }); 
}
