const sinon = require("sinon");
const chance = require("chance").Chance();

const MockController = require("../mocks/controller");
const jobSampleScript = require("../../sample-script/job");

describe("sample-script / job", () => {
    let controller;

    beforeEach(async () => {
        controller = new MockController({});
        controller.plugins.slack.whoAmI = sinon
            .stub()
            .resolves({ real_name: chance.word() });
        controller.plugins.help.addCommand = sinon.spy();
        await jobSampleScript(controller);
    });

    describe("run job listener", () => {
        it("creates job and watches for job pods", async () => {
            const job = {
                resource: {
                    metadata: {
                        name: chance.word(),
                    },
                },
                start: sinon
                    .stub()
                    .returns({ metadata: { name: chance.word() } }),
                destroy: sinon.spy(),
            };
            controller.plugins.kubernetes.newJob = sinon.stub();
            controller.plugins.kubernetes.newJob.returns(job);
            const watch = {
                start: sinon.spy(),
                stop: sinon.spy(),
            };
            controller.plugins.kubernetes.newWatch = sinon.stub();
            controller.plugins.kubernetes.newWatch.returns(watch);

            await controller.userInput({ text: "run job" });

            const watchCallback =
                controller.plugins.kubernetes.newWatch.args[0][0];

            await watchCallback("ADDED", {
                metadata: { name: chance.word() },
                status: { phase: null },
            });
            await watchCallback("MODIFIED", {
                metadata: { name: chance.word() },
                status: { phase: "Pending" },
            });
            await watchCallback("MODIFIED", {
                metadata: { name: chance.word() },
                status: { phase: "Succeeded" },
            });
            await watchCallback("DELETED", {
                metadata: { name: chance.word() },
                status: { phase: "Succeeded" },
            });

            sinon.assert.called(controller.plugins.kubernetes.newJob);
            sinon.assert.called(controller.plugins.kubernetes.newWatch);
            sinon.assert.called(job.start);
            sinon.assert.called(job.destroy);
            sinon.assert.called(watch.start);
            sinon.assert.called(watch.stop);
        });
    });
});
