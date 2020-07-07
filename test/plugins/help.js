const sinon = require("sinon");
const chance = require("chance").Chance();
const expect = require("chai").expect;

const MockController = require("../mocks/controller");

const help = require("../../plugins/help");

describe("plugins / help", () => {
    let controller;

    beforeEach(() => {
        controller = new MockController({});
    });

    describe("init", () => {
        it("should add plugin extensions", () => {
            help.init(controller);
            sinon.assert.calledOnce(controller.addPluginExtension);
            sinon.assert.calledWith(
                controller.addPluginExtension,
                "help",
                help
            );
        });
    });

    describe("addCommand", () => {
        it("should not cause an error", () => {
            help.addCommand(chance.word(), chance.word(), chance.sentence());
        });
    });

    describe("getMessage", () => {
        let command, name, description;
        before(() => {
            command = chance.word();
            name = chance.word();
            description = chance.sentence();
            help.addCommand(command, name, description);
        });
        it("should return help message", () => {
            const message = help.getMessage();

            expect(message.blocks).to.have.length(4);
            expect(message.blocks[3].text.text).to.contain(command);
            expect(message.blocks[3].text.text).to.contain(name);
            expect(message.blocks[3].text.text).to.contain(description);
        });
    });
});
