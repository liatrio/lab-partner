const { BotkitConversation } = require("botkit");

module.exports = function (controller) {
    let stop;

    controller.hears([/^try kube$/], "direct_mention", async (bot, message) => {
        console.log("Script kubernetes.js: Watching for K8s pods");
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
        const kubeResource = {
            type: "event",
            resource: "",
            group: "",
        };
        stop = controller.plugins.kubernetes.startWatch(
            kubeResource,
            "default",
            (type, object) => {
                console.log("Event detected");
                console.log("Type", type);
                console.log("Object", object);
            }
        );

        await bot.reply(message, {
            blocks: [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: "Kubernetes plugin tested!",
                    },
                },
            ],
        });
    });

    controller.hears("stop", "direct_mention", async (bot, message) => {
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
