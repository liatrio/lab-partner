const sinon = require("sinon");
const chance = require("chance").Chance();
const { expect } = require("chai");
const MockController = require("../mocks/controller");

const kubernetes = require("../../plugins/kubernetes");
const Job = require("../../lib/k8s/job");
const Watch = require("../../lib/k8s/watch");

describe("plugins / kubernetes", () => {
    let controller;

    describe("Setup", () => {
        describe("getKubernetesClient", () => {
            it("should return without error", () => {
                kubernetes.getK8s();
            });
        });
    });

    describe("plugin init", () => {
        beforeEach(() => {
            controller = new MockController({});
        });

        describe("init", () => {
            it("should add plugin extensions", () => {
                kubernetes.init(controller);
                sinon.assert.calledOnce(controller.addPluginExtension);
                sinon.assert.calledWith(
                    controller.addPluginExtension,
                    "kubernetes",
                    kubernetes
                );
            });
        });
    });

    describe("new job", () => {
        it("returns job instance", () => {
            const name = chance.word();
            const resource = {};

            const job = kubernetes.newJob(name, resource);

            expect(job).is.a.instanceof(Job);
        });
    });

    describe("new watch", () => {
        it("returns watch instance", () => {
            const name = chance.word();
            const resource = {};

            const job = kubernetes.newWatch(name, resource);

            expect(job).is.a.instanceof(Watch);
        });
    });
});
