module.exports = (controller) => {
    const renderParticipantsBlocks = async (participants) => {
        return Promise.all(
            participants.map((participant) =>
                renderParticipantBlocks(participant)
            )
        ).then((participants) => participants.flat());
    };

    const renderParticipantBlocks = async (participant) => {
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
                    text: participants.getGaugeString(gauge),
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

    const participants = {
        name: "Participants",
        init: () => {
            controller.addPluginExtension("participants", participants);
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

            return Promise.all([userInfo, details, links, gauges]).then(
                (result) => {
                    return {
                        info: result[0],
                        details: result[1],
                        links: result[2],
                        gauges: result[3],
                    };
                }
            );
        },
        getParticipants: async () => {
            const allDetails = controller.plugins.storage.getUserDetails();
            const allLinks = controller.plugins.storage.getUserLinks();
            const allGauges = controller.plugins.storage.getUserGauges();

            return Promise.all([allDetails, allLinks, allGauges]).then(
                (result) => {
                    const participants = [
                        ...result[0],
                        ...result[1],
                        ...result[2],
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
                            const details = result[0].filter((detail) => {
                                return detail.userId === item.userId;
                            });
                            const links = result[1].filter(
                                (link) => link.userId === item.userId
                            );
                            const gauges = result[2].filter(
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
                }
            );
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
    return participants;
};
