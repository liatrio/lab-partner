const { BotkitConversation } = require("botkit");

module.exports = function (controller) {
    controller.hears([/^add me$/], "direct_mention", async (bot, message) => {
        console.log("Script github.js: Adding Github user");

        const confirmation = new BotkitConversation(message.ts, controller);

        await bot.startConversationInChannel(message.channel, message.user);
        confirmation.ask(
            "Enter your Github username",
            async (username) => {
                const user = await controller.plugins.github.getGithubUser(
                    username
                );
                controller.plugins.github.watchForNewRepo(username, (repo) => {
                    bot.say({
                        blocks: [
                            {
                                type: "section",
                                text: {
                                    type: "mrkdwn",
                                    text: `A new repo was added! ${repo.full_name}`,
                                },
                            },
                        ],
                    });
                });

                const repos = await controller.plugins.github.getUserRepositories(
                    username
                );
                for (var i = 0; i < repos.length; i++) {
                    const repo = repos[i].full_name.split("/")[1];
                    controller.plugins.github.watchForNewCommits(
                        username,
                        repo,
                        (commit) => {
                            bot.say({
                                blocks: [
                                    {
                                        type: "section",
                                        text: {
                                            type: "mrkdwn",
                                            text: `A new commit was pushed to ${repos[i].full_name}!`,
                                        },
                                    },
                                ],
                            });
                        }
                    );
                }

                var repoNames = [];
                for (var i = 0; i < repos.length; i++) {
                    repoNames.push(repos[i].full_name.split("/")[1]);
                }
                await confirmation.say({
                    blocks: [
                        {
                            type: "section",
                            text: {
                                type: "mrkdwn",
                                text: `Repo list for ${username}:\n ${repoNames}`,
                            },
                        },
                    ],
                });
            },
            "username"
        );

        controller.addDialog(confirmation);
        await bot.startConversationInThread(
            message.channel,
            message.user,
            message.ts
        );
        await bot.beginDialog(message.ts);
    });
};
