module.exports = (controller) => {
    const renderParticipantsBlocks = (participants) => {
        return participants
            .map((participant) => renderParticipantBlocks(participant))
            .flat();
    };

    const renderParticipantBlocks = (participant) => {
        const links = participant.links.map((link) => {
            return {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `:link: <${link.url}|${link.name}>`,
                },
            };
        });
        const gauges = participant.gauges.map((gauge) => {
            return {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: participantsPlugin.getGaugeString(gauge),
                },
            };
        });
        const details = participant.details.map((detail) => {
            return {
                type: "mrkdwn",
                text: `*${detail.name}*: ${detail.value}`,
            };
        });
        return [
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `:bust_in_silhouette: *${participant.info.real_name}*`,
                },
                accessory: {
                    type: "image",
                    image_url: participant.info.profile.image_72,
                    alt_text: participant.info.real_name,
                },
                fields: details.length ? details : undefined,
            },
            ...gauges,
            ...links,
        ];
    };

    const renderNoContentBlocks = () => {
        return [
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text:
                        "Nothing to display yet. Try adding some participant info.",
                },
            },
        ];
    };

    const participantsPlugin = {
        name: "Participants",
        init: () => {
            controller.addPluginExtension("participants", participantsPlugin);
        },
        getParticipant: async (userId) => {
            const userInfo = controller.plugins.slack.getUserInfo(userId);
            const details = controller.plugins.storage.getUserDetailsForUser(
                userId
            );
            const links = controller.plugins.storage.getUserLinksForUser(
                userId
            );
            const gauges = controller.plugins.storage.getUserGaugesForUser(
                userId
            );

            const allItems = await Promise.all([
                userInfo,
                details,
                links,
                gauges,
            ]);

            return {
                info: allItems[0],
                details: allItems[1],
                links: allItems[2],
                gauges: allItems[3],
            };
        },
        getParticipants: async () => {
            const allDetails = controller.plugins.storage.getUserDetails();
            const allLinks = controller.plugins.storage.getUserLinks();
            const allGauges = controller.plugins.storage.getUserGauges();

            const allItems = await Promise.all([
                allDetails,
                allLinks,
                allGauges,
            ]);

            const participants = [
                ...allItems[0],
                ...allItems[1],
                ...allItems[2],
            ]
                // remove duplicate users
                .filter((item, index, self) => {
                    return (
                        self.findIndex((i) => {
                            return i.userId === item.userId;
                        }) === index
                    );
                })
                // build participant object
                .map(async (item) => {
                    const info = await controller.plugins.slack.getUserInfo(
                        item.userId
                    );
                    const details = allItems[0].filter((detail) => {
                        return detail.userId === item.userId;
                    });
                    const links = allItems[1].filter(
                        (link) => link.userId === item.userId
                    );
                    const gauges = allItems[2].filter(
                        (gauge) => gauge.userId === item.userId
                    );
                    return {
                        info,
                        details,
                        links,
                        gauges,
                    };
                });
            return Promise.all(participants);
        },
        getParticipantBlocks: async (user) => {
            const participant = await controller.plugins.participants.getParticipant(
                user
            );
            if (participant) {
                return await renderParticipantBlocks(participant);
            } else {
                return renderNoContentBlocks();
            }
        },
        getParticipantsBlocks: async () => {
            const participants = await controller.plugins.participants.getParticipants();
            if (participants.length) {
                return await renderParticipantsBlocks(participants);
            } else {
                return renderNoContentBlocks();
            }
        },
        getGaugeString: (gauge) => {
            return `*${gauge.name}*: ${gauge.currentName} ${
                gauge.currentValue
            }/${gauge.maxValue} ${":white_check_mark:".repeat(
                gauge.currentValue
            )}${":x:".repeat(gauge.maxValue - gauge.currentValue)}`;
        },
    };
    return participantsPlugin;
};
