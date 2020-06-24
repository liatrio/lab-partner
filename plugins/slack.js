const NodeCache = require("node-cache");

const userInfoCache = new NodeCache({ stdTTL: 86400 });

module.exports = (botkit) => {
    const slack = {
        name: "Slack Helper",
        init: (controller) => {
            controller.addPluginExtension("slack", slack);
        },
        whoAmI: async () => {
            let userInfo = userInfoCache.get(0);
            if (userInfo === undefined) {
                const bot = await botkit.spawn(process.env.TEAM);
                const auth = await bot.api.auth.test();
                userInfo = await slack.getUserInfo(auth.user_id);
                userInfoCache.set(0, userInfo);
            }
            return userInfo;
        },
        getUserInfo: async (id) => {
            let userInfo = userInfoCache.get(id);
            if (userInfo === undefined) {
                const bot = await botkit.spawn(process.env.TEAM);
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
