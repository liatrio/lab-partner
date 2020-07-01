const sinon = require("sinon");
const should = require("chai").should(); // eslint-disable-line no-unused-vars
const chance = require("chance").Chance();
const MockController = require("../mocks/controller");

const inviteFeature = require("../../sample-script/invite");

describe("sample script / invite", () => {
    let controller;

    beforeEach(async () => {
        controller = new MockController({});
        await inviteFeature(controller);
    });

    it("ignores channel invites for other users", async () => {
        const botUser = chance.hash();
        controller.bot.startConversationInChannel = sinon.spy();

        await controller.event("channel_join", {
            user: chance.hash(),
            incoming_message: { recipient: { id: botUser } },
        });

        sinon.assert.notCalled(controller.bot.startConversationInChannel);
    });

    it("response to channel invite", async () => {
        const botUser = chance.hash();
        const blocks = [{ block: chance.hash() }];
        controller.plugins.storage.setUserDetail = sinon.spy();
        controller.plugins.help.getMessage = sinon.stub();
        controller.plugins.help.getMessage.returns({ blocks });
        controller.bot.say = sinon.spy();

        await controller.event("channel_join", {
            user: botUser,
            incoming_message: { recipient: { id: botUser } },
        });

        sinon.assert.calledOnce(controller.plugins.help.getMessage);
        sinon.assert.calledOnce(controller.bot.say);
        const message = controller.bot.say.firstCall.args[0];
        message.should.contain.keys(["blocks"]);
        message.blocks.should.be.an("array").with.lengthOf(2);
        message.blocks[1].should.include(blocks[0]);
    });
});
