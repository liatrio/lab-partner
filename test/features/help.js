const sinon = require("sinon");
const should = require("chai").should(); // eslint-disable-line no-unused-vars
const chance = require("chance").Chance();

const MockController = require("../mocks/controller");

const helpFeature = require("../../features/help");

describe("features / help", () => {
    let controller;

    describe("initialize feature", () => {
        beforeEach(() => {
            controller = new MockController({});
            controller.plugins.help = {
                addCommand: sinon.spy(),
            };
            controller.plugins.slack = {
                whoAmI: sinon.stub().resolves({ real_name: chance.name() }),
            };
            controller.hears = sinon.spy();
        });

        it("initializes help feature", async () => {
            await helpFeature(controller);
            sinon.assert.calledOnce(controller.plugins.slack.whoAmI);
            sinon.assert.calledOnce(controller.plugins.help.addCommand);
            sinon.assert.calledOnce(controller.hears);
        });
    });

    describe("responds to events", () => {
        beforeEach(async () => {
            controller = new MockController({});
            controller.plugins.help = {
                addCommand: sinon.spy(),
                getMessage: sinon.stub().returns({ blocks: [] }),
            };
            controller.plugins.slack = {
                whoAmI: sinon.stub().resolves({ real_name: chance.name() }),
            };
            await helpFeature(controller);
        });

        it("Should respond to help command", async () => {
            await controller.userInput({ text: "help" });
            const replies = controller.getReplies();

            replies.should.have.lengthOf(1);
        });
    });
});
