module.exports = async (controller) => {
    console.log("Enabling feature: Home");

    controller.on("app_home_opened", async (bot, message) => {
        if (message.tab === "home") {
            console.log("Feature home.js: Home tab opened");

            let blocks;
            const user = await controller.plugins.slack.getUserInfo(
                message.user
            );
            if (user.is_admin || user.is_owner || user.is_primary_owner) {
                blocks = await controller.plugins.participants.getParticipantsBlocks();
            } else {
                blocks = await controller.plugins.participants.getParticipantBlocks(
                    message.user
                );
            }
            const response = await bot.api.views.publish({
                user_id: message.user,
                view: {
                    type: "home",
                    blocks,
                },
            });
            if (!response.ok) {
                console.error(
                    `Failed updating Slack home tab: ${response.error}`
                );
            }
        }
    });
};
