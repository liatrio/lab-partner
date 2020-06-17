const NodeCache = require("node-cache");

const userInfoCache = new NodeCache({ stdTTL: 86400 });

module.exports = (/* botkit */) => {
    const slack = {
        name: "Slack Helper",
        init: (controller) => {
            controller.addPluginExtension("slack", slack);
        },
        getUserInfo: async (id, bot) => {
            let userInfo = userInfoCache.get(id);
            if (userInfo === undefined) {
                const response = await bot.api.users.info({ user: id });
                if (response.ok) {
                    userInfo = response.user;
                    userInfoCache.set(id, userInfo);
                } else {
                    throw new Error(
                        `Slack user (${id}) not found: ${response.error}`
                    );
                }
            }
            return userInfo;
        },
    };
    return slack;
};
