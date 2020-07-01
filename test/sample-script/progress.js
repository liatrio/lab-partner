const sinon = require("sinon");
const should = require("chai").should(); // eslint-disable-line no-unused-vars
const chance = require("chance").Chance();
const MockController = require("../mocks/controller");

const progressFeature = require("../../sample-script/progress");

const createGauge = () => {
    return {
        userId: chance.hash(),
        name: "Lab Progress",
        currentName: "Step Three",
        currentValue: 3,
        maxValue: 5,
    };
};

describe("sample script / invite", () => {
    let controller;

    beforeEach(async () => {
        controller = new MockController({});
        controller.plugins.help.addCommand = sinon.spy();
        await progressFeature(controller);
    });

    it("hears progress", async () => {
        const gauge = createGauge();
        const gaugeString = chance.sentence();
        controller.plugins.storage.getUserGaugeForUser = sinon
            .stub()
            .resolves(gauge);
        controller.plugins.participants.getGaugeString = sinon
            .stub()
            .resolves(gaugeString);

        await controller.userInput({ text: "progress" });

        const replies = controller.getReplies();

        sinon.assert.calledWith(
            controller.plugins.participants.getGaugeString,
            gauge
        );
        replies.should.have.lengthOf(1);
        replies[0].response.blocks[0].text.text.should.equal(gaugeString);
    });

    it("hears progress next", async () => {
        const gauge = createGauge();
        const gaugeString = chance.sentence();
        const gaugeNext = {
            ...gauge,
            currentName: "Step Four",
            currentValue: 4,
        };
        controller.plugins.storage.getUserGaugeForUser = sinon
            .stub()
            .resolves(gauge);
        controller.plugins.storage.setUserGauge = sinon
            .stub()
            .resolves(gaugeNext);
        controller.plugins.participants.getGaugeString = sinon
            .stub()
            .resolves(gaugeString);

        await controller.userInput({
            user: gauge.userId,
            text: "progress next",
        });

        const replies = controller.getReplies();

        sinon.assert.calledWith(
            controller.plugins.storage.setUserGauge,
            gaugeNext.userId,
            gaugeNext.name,
            gaugeNext.currentName,
            gaugeNext.currentValue,
            gaugeNext.maxValue
        );
        sinon.assert.calledWith(
            controller.plugins.participants.getGaugeString,
            gaugeNext
        );
        replies.should.have.lengthOf(1);
        replies[0].response.blocks.should.have.lengthOf(2);
        replies[0].response.blocks[1].text.text.should.equal(gaugeString);
    });

    it("hears progress back", async () => {
        const gauge = createGauge();
        const gaugeString = chance.sentence();
        const gaugeBack = {
            ...gauge,
            currentName: "Step Two",
            currentValue: 2,
        };
        controller.plugins.storage.getUserGaugeForUser = sinon
            .stub()
            .resolves(gauge);
        controller.plugins.storage.setUserGauge = sinon
            .stub()
            .resolves(gaugeBack);
        controller.plugins.participants.getGaugeString = sinon
            .stub()
            .resolves(gaugeString);

        await controller.userInput({
            user: gauge.userId,
            text: "progress back",
        });

        const replies = controller.getReplies();

        sinon.assert.calledWith(
            controller.plugins.storage.setUserGauge,
            gaugeBack.userId,
            gaugeBack.name,
            gaugeBack.currentName,
            gaugeBack.currentValue,
            gaugeBack.maxValue
        );
        sinon.assert.calledWith(
            controller.plugins.participants.getGaugeString,
            gaugeBack
        );
        replies.should.have.lengthOf(1);
        replies[0].response.blocks.should.have.lengthOf(2);
        replies[0].response.blocks[1].text.text.should.equal(gaugeString);
    });

    it("Stops at beginning", async () => {
        const gauge = { ...createGauge, currentValue: 1 };
        const gaugeString = chance.sentence();
        controller.plugins.storage.getUserGaugeForUser = sinon
            .stub()
            .resolves(gauge);
        controller.plugins.participants.getGaugeString = sinon
            .stub()
            .resolves(gaugeString);

        await controller.userInput({
            user: gauge.userId,
            text: "progress back",
        });

        const replies = controller.getReplies();

        replies.should.have.lengthOf(1);
        replies[0].response.blocks.should.have.lengthOf(2);
        replies[0].response.blocks[0].text.text.should.equal(
            "You are already on the first step"
        );
    });

    it("Stops at end", async () => {
        const gauge = { ...createGauge, currentValue: 5 };
        const gaugeString = chance.sentence();
        controller.plugins.storage.getUserGaugeForUser = sinon
            .stub()
            .resolves(gauge);
        controller.plugins.participants.getGaugeString = sinon
            .stub()
            .resolves(gaugeString);

        await controller.userInput({
            user: gauge.userId,
            text: "progress next",
        });

        const replies = controller.getReplies();

        replies.should.have.lengthOf(1);
        replies[0].response.blocks.should.have.lengthOf(2);
        replies[0].response.blocks[0].text.text.should.equal(
            "You are already on the last step"
        );
    });
});
