const features = [];

const help = {
    name: "Help",
    init: (controller) => {
        controller.addPluginExtension("help", help);
    },
    getMessage: () => {
        const message = {
            blocks: [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text:
                            "I'm an interactive bot to help guide participants through lab exercises. I can respond to questions, track participant progress and check work in remote source repositories.",
                    },
                },
                {
                    type: "divider",
                },
            ],
        };
        features.forEach((feature) => {
            message.blocks.push({
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*${feature.name}* - ${feature.description} \`\`\`${feature.command}\`\`\``,
                },
            });
        });
        return message;
    },
    addCommand: (command, name, description) => {
        features.push({ command, name, description });
    },
};

module.exports = help;
