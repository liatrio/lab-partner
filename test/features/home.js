const sinon = require("sinon");
const chance = require("chance").Chance();
const MockController = require("../mocks/controller");

const homeFeature = require("../../features/home");

describe("features / home", () => {
    let controller;

    beforeEach(async () => {
        controller = new MockController({});
        await homeFeature(controller);
    });

    describe("on home tab open", () => {
        it("displays admin page", async () => {
            const user = chance.hash();
            const userType = chance.integer({ min: 0, max: 2 });
            controller.plugins.slack.getUserInfo = sinon
                .stub()
                .withArgs(user)
                .resolves({
                    is_owner: userType === 0,
                    is_admin: userType === 1,
                    is_primary_owner: userType === 2,
                });
            const blocks = [chance.hash];
            controller.plugins.participants.getParticipantsBlocks = sinon
                .stub()
                .resolves(blocks);
            controller.bot.api.views.publish = sinon
                .stub()
                .resolves({ ok: true });

            await controller.event("app_home_opened", { tab: "home", user });

            sinon.assert.calledOnce(
                controller.plugins.participants.getParticipantsBlocks
            );
            sinon.assert.calledWith(controller.bot.api.views.publish, {
                user_id: user,
                view: {
                    type: "home",
                    blocks,
                },
            });
        });

        it("displays participant page", async () => {
            const user = chance.hash();
            controller.plugins.slack.getUserInfo = sinon
                .stub()
                .withArgs(user)
                .resolves({
                    is_owner: false,
                    is_admin: false,
                    is_primary_owner: false,
                });
            const blocks = [chance.hash];
            controller.plugins.participants.getParticipantBlocks = sinon
                .stub()
                .resolves(blocks);
            controller.bot.api.views.publish = sinon
                .stub()
                .resolves({ ok: true });

            await controller.event("app_home_opened", { tab: "home", user });

            sinon.assert.calledOnce(
                controller.plugins.participants.getParticipantBlocks
            );
            sinon.assert.calledWith(controller.bot.api.views.publish, {
                user_id: user,
                view: {
                    type: "home",
                    blocks,
                },
            });
        });
    });
});
