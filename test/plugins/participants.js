const sinon = require("sinon");
const chance = require("chance").Chance();
const expect = require("chai").expect;

const MockController = require("../mocks/controller");

const ParticipantsPlugin = require("../../plugins/participants");

describe("plugins / participants", () => {
    let controller;
    let participantsPlugin;

    beforeEach(() => {
        controller = new MockController({});
        participantsPlugin = ParticipantsPlugin(controller);
    });

    describe("init", () => {
        it("should add plugin extensions", () => {
            participantsPlugin.init(controller);
            sinon.assert.calledOnce(controller.addPluginExtension);
            sinon.assert.calledWith(
                controller.addPluginExtension,
                "participants",
                participantsPlugin
            );
        });
    });

    describe("getParticipants()", () => {
        it("returns participant list", async () => {
            const user1 = chance.hash();
            const user2 = chance.hash();
            const user3 = chance.hash();
            const detail1 = {
                userId: user1,
                name: chance.word(),
                value: chance.word(),
            };
            const detail2 = {
                userId: user2,
                name: chance.word(),
                value: chance.word(),
            };
            controller.plugins.storage.getUserDetails = sinon
                .stub()
                .resolves([detail1, detail2]);
            const link1 = {
                userId: user2,
                name: chance.word(),
                url: chance.url(),
            };
            const link2 = {
                userId: user3,
                name: chance.word(),
                url: chance.url(),
            };
            controller.plugins.storage.getUserLinks = sinon
                .stub()
                .resolves([link1, link2]);
            const gauge1 = {
                userId: user1,
                name: chance.word(),
                currentName: chance.word(),
                currentValue: chance.integer({ min: 1, max: 30 }),
                maxValue: 30,
            };
            controller.plugins.storage.getUserGauges = sinon
                .stub()
                .resolves([gauge1]);
            controller.plugins.slack.getUserInfo = sinon.stub();
            controller.plugins.slack.getUserInfo
                .withArgs(user1)
                .resolves({ id: user1 });
            controller.plugins.slack.getUserInfo
                .withArgs(user2)
                .resolves({ id: user2 });
            controller.plugins.slack.getUserInfo
                .withArgs(user3)
                .resolves({ id: user3 });

            const participants = await participantsPlugin.getParticipants();

            expect(participants).to.have.lengthOf(3);
            expect(participants).to.deep.include({
                info: { id: user1 },
                details: [detail1],
                links: [],
                gauges: [gauge1],
            });
            expect(participants).to.deep.include({
                info: { id: user2 },
                details: [detail2],
                links: [link1],
                gauges: [],
            });
            expect(participants).to.deep.include({
                info: { id: user3 },
                details: [],
                links: [link2],
                gauges: [],
            });
            sinon.assert.calledOnce(controller.plugins.storage.getUserDetails);
            sinon.assert.calledOnce(controller.plugins.storage.getUserLinks);
            sinon.assert.calledOnce(controller.plugins.storage.getUserGauges);
            sinon.assert.calledThrice(controller.plugins.slack.getUserInfo);
        });
    });

    describe("getParticipant()", () => {
        it("returns participant details", async () => {
            const user = chance.hash();

            const detail1 = {
                userId: user,
                name: chance.word(),
                value: chance.word(),
            };
            const detail2 = {
                userId: user,
                name: chance.word(),
                value: chance.word(),
            };
            controller.plugins.storage.getUserDetailsForUser = sinon
                .stub()
                .resolves([detail1, detail2]);

            const link1 = {
                userId: user,
                name: chance.word(),
                url: chance.url(),
            };
            const link2 = {
                userId: user,
                name: chance.word(),
                url: chance.url(),
            };
            controller.plugins.storage.getUserLinksForUser = sinon
                .stub()
                .resolves([link1, link2]);

            const gauge1 = {
                userId: user,
                name: chance.word(),
                currentName: chance.word(),
                currentValue: chance.integer({ min: 1, max: 30 }),
                maxValue: 30,
            };
            const gauge2 = {
                userId: user,
                name: chance.word(),
                currentName: chance.word(),
                currentValue: chance.integer({ min: 1, max: 30 }),
                maxValue: 30,
            };
            controller.plugins.storage.getUserGaugesForUser = sinon
                .stub()
                .resolves([gauge1, gauge2]);

            controller.plugins.slack.getUserInfo = sinon
                .stub()
                .resolves({ id: user });

            const participant = await participantsPlugin.getParticipant(user);

            sinon.assert.calledWith(
                controller.plugins.storage.getUserDetailsForUser,
                user
            );
            sinon.assert.calledWith(
                controller.plugins.storage.getUserLinksForUser,
                user
            );
            sinon.assert.calledWith(
                controller.plugins.storage.getUserGaugesForUser,
                user
            );
            sinon.assert.calledWith(controller.plugins.slack.getUserInfo, user);
            expect(participant).to.deep.contain({
                info: { id: user },
                details: [detail1, detail2],
                links: [link1, link2],
                gauges: [gauge1, gauge2],
            });
        });
    });

    describe("getParticipantBlocks()", () => {
        it("returns no participants message", async () => {
            const user = chance.hash();
            controller.plugins.participants.getParticipant = sinon.stub();
            controller.plugins.participants.getParticipant.resolves(undefined);

            const participantBlocks = await participantsPlugin.getParticipantBlocks(
                user
            );

            expect(participantBlocks).to.have.lengthOf(1);
            expect(participantBlocks[0].text.text).to.contain(
                "Nothing to display"
            );
            sinon.assert.calledWith(
                controller.plugins.participants.getParticipant,
                user
            );
        });

        it("return participant detail message blocks", async () => {
            const user = {
                id: chance.hash(),
                real_name: chance.name(),
                profile: {
                    image_72: chance.url(),
                },
            };
            const detail = {
                userId: user,
                name: chance.name(),
                value: chance.sentence(),
            };
            const link = {
                userId: user,
                name: chance.name(),
                url: chance.url(),
            };
            const gauge = {
                userId: user,
                name: chance.name(),
                currentName: chance.name(),
                currentValue: chance.integer({ min: 1, max: 10 }),
                maxValue: 10,
            };
            controller.plugins.participants.getParticipant = sinon.stub();
            controller.plugins.participants.getParticipant.resolves({
                info: user,
                details: [detail],
                links: [link],
                gauges: [gauge],
            });

            const participantBlocks = await participantsPlugin.getParticipantBlocks(
                user.id
            );

            expect(participantBlocks).to.have.lengthOf(3);
            expect(participantBlocks[0]).to.contain.keys([
                "type",
                "text",
                "accessory",
                "fields",
            ]);
            expect(participantBlocks[0].text).to.contain.keys(["type", "text"]);
            expect(participantBlocks[0].text.text).to.contain(user.real_name);
            expect(participantBlocks[1]).to.contain.keys(["type", "text"]);
            expect(participantBlocks[1].text).to.contain.keys(["type", "text"]);
            expect(participantBlocks[1].text.text).to.contain(gauge.name);
            expect(participantBlocks[1].text.text).to.contain(
                gauge.currentName
            );
            expect(participantBlocks[2]).to.contain.keys(["type", "text"]);
            expect(participantBlocks[2].text).to.contain.keys(["type", "text"]);
            expect(participantBlocks[2].text.text).to.contain(link.name);
            expect(participantBlocks[2].text.text).to.contain(link.url);
            sinon.assert.calledWith(
                controller.plugins.participants.getParticipant,
                user.id
            );
        });
    });

    describe("getParticipantsBlocks()", () => {
        it("returns no participants message", async () => {
            controller.plugins.participants.getParticipants = sinon
                .stub()
                .resolves([]);

            const participantsBlocks = await participantsPlugin.getParticipantsBlocks();

            sinon.assert.calledOnce(
                controller.plugins.participants.getParticipants
            );
            expect(participantsBlocks).to.have.lengthOf(1);
            expect(participantsBlocks[0].text.text).to.contain(
                "Nothing to display"
            );
        });

        it("concatenates participant blocks", async () => {
            const p1 = {
                info: {
                    id: chance.hash(),
                    real_name: chance.name(),
                    profile: { image_72: chance.url() },
                },
                details: [{ name: chance.name(), value: chance.sentence() }],
                links: [{ name: chance.name(), url: chance.url() }],
                gauges: [
                    {
                        name: chance.name(),
                        currentName: chance.name(),
                        currentValue: chance.integer({ min: 1, max: 10 }),
                        maxValue: 10,
                    },
                ],
            };
            const p2 = {
                info: {
                    id: chance.hash(),
                    real_name: chance.name(),
                    profile: { image_72: chance.url() },
                },
                details: [],
                links: [{ name: chance.name(), url: chance.url() }],
                gauges: [
                    {
                        name: chance.name(),
                        currentName: chance.name(),
                        currentValue: chance.integer({ min: 1, max: 10 }),
                        maxValue: 10,
                    },
                ],
            };
            controller.plugins.participants.getParticipants = sinon
                .stub()
                .resolves([p1, p2]);

            const participantsBlocks = await participantsPlugin.getParticipantsBlocks();

            sinon.assert.calledOnce(
                controller.plugins.participants.getParticipants
            );
            expect(participantsBlocks).to.have.lengthOf(6);
            expect(participantsBlocks[0]).to.contain.keys([
                "accessory",
                "fields",
                "text",
                "type",
            ]);
            expect(participantsBlocks[0].text).to.contain.keys([
                "type",
                "text",
            ]);
            expect(participantsBlocks[0].text.text).to.contain(
                p1.info.real_name
            );
            expect(participantsBlocks[3]).to.contain.keys([
                "accessory",
                "fields",
                "text",
                "type",
            ]);
            expect(participantsBlocks[3].text).to.contain.keys([
                "type",
                "text",
            ]);
            expect(participantsBlocks[3].text.text).to.contain(
                p2.info.real_name
            );
        });
    });
});
