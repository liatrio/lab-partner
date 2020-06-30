let details = [];
let links = [];
let gauges = [];

module.exports = (controller) => {
    const storage = {
        name: "Storage",
        init: () => {
            controller.addPluginExtension("storage", storage);
        },

        async setUserDetail(userId, name, value) {
            // TODO replace with mongo db query
            const index = details.findIndex(
                (detail) => detail.userId === userId && detail.name === name
            );
            if (index !== -1) {
                details.splice(index, 1);
            }
            details.push({ userId, name, value });
        },
        async getUserDetails() {
            // TODO replace with mongo db query
            return Promise.resolve(details);
        },
        async getUserDetailsForUser(userId) {
            // TODO replace with mongo db query
            return Promise.resolve(
                details.filter((detail) => detail.userId === userId)
            );
        },
        async getUserDetailForUser(userId, name) {
            return Promise.resolve(
                details.filter(
                    (detail) => detail.userId === userId && detail.name === name
                )
            );
        },

        async setUserGauge(userId, name, currentName, currentValue, maxValue) {
            // TODO replace with mongo db query
            const index = gauges.findIndex(
                (gauge) => gauge.userId === userId && gauge.name === name
            );
            if (index !== -1) {
                gauges.splice(index, 1);
            }
            gauges.push({ userId, name, currentName, currentValue, maxValue });
            return Promise.resolve(gauges[gauges.length - 1]);
        },
        async getUserGauges() {
            // TODO replace with mongo db query
            return Promise.resolve(gauges);
        },
        async getUserGaugesForUser(userId) {
            // TODO replace with mongo db query
            return Promise.resolve(
                gauges.filter((gauge) => gauge.userId === userId)
            );
        },
        async getUserGaugeForUser(userId, name) {
            // TODO replace with mongo db query
            return Promise.resolve(
                gauges.filter(
                    (gauge) => gauge.userId === userId && gauge.name === name
                )[0]
            );
        },

        async setUserLink(userId, name, url) {
            // TODO replace with mongo db query
            const index = links.findIndex(
                (link) => link.userId === userId && link.name === name
            );
            if (index !== -1) {
                links.splice(index, 1);
            }
            links.push({ userId, name, url });
        },
        async getUserLinks() {
            // TODO replace with mongo db query
            return Promise.resolve(links);
        },
        async getUserLinksForUser(userId) {
            // TODO replace with mongo db query
            return Promise.resolve(
                links.filter((link) => link.userId === userId)
            );
        },
        async getUserLinkForUser(userId, name) {
            // TODO replace with mongo db query
            return Promise.resolve(
                links.filter(
                    (link) => link.userId === userId && link.name === name
                )
            );
        },
    };

    return storage;
};
