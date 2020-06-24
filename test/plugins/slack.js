const sinon = require("sinon");
const assert = require("assert");
const chance = require("chance").Chance();

const MockController = require("../mocks/controller");
const MockBotKit = require("../mocks/botkit");

const slackPluginModule = require("../../plugins/slack");

describe("plugins / slack", () => {
    let controller;
    let botkit;
    let slackPlugin;

    beforeEach(() => {
        controller = new MockController({});
        botkit = new MockBotKit(controller);
        slackPlugin = slackPluginModule(botkit);
    });

    describe("init", () => {
        it("should add plugin extensions", () => {
            slackPlugin.init(controller);
            sinon.assert.calledOnce(controller.addPluginExtension);
            sinon.assert.calledWith(
                controller.addPluginExtension,
                "slack",
                slackPlugin
            );
        });
    });

    describe("whoAmI", () => {
        it("should call getUserInfo() and cache result", async () => {
            sinon.stub(slackPlugin, "getUserInfo").resolves({});
            const user_id = chance.hash();
            controller.bot.api.auth.test.resolves({ user_id });

            await slackPlugin.whoAmI(); // calls getUserInfo()
            await slackPlugin.whoAmI(); // returns cached result

            sinon.assert.calledOnce(slackPlugin.getUserInfo);
            sinon.assert.calledWith(slackPlugin.getUserInfo, user_id);
        });
    });

    describe("getUserInfo", () => {
        it("should call slack api users.info and cache result", async () => {
            const userId = chance.hash();
            controller.bot.api.users.info.resolves({ ok: true, user: {} });

            await slackPlugin.getUserInfo(userId);
            await slackPlugin.getUserInfo(userId);

            sinon.assert.calledOnce(controller.bot.api.users.info);
            sinon.assert.calledWith(controller.bot.api.users.info, {
                user: userId,
            });
        });

        it("should throw error on invalid user", async () => {
            const userId = chance.hash();
            controller.bot.api.users.info.resolves({
                ok: false,
                error: "that didn't work",
            });

            assert.rejects(async () => {
                await slackPlugin.getUserInfo(userId);
            });
        });
    });
});
