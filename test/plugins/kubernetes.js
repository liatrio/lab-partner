const sinon = require("sinon");
const expect = require("chai").expect;
const chance = require("chance").Chance();

const MockController = require("../mocks/controller");

const kubernetes = require("../../plugins/kubernetes");

describe("plugins / kubernetes", () => {
    let controller;
    let kubernetesClientStub;
    let clock;

    describe("Setup", () => {
        describe("getKubernetesClient", () => {
            it("should return Octokit with auth if undefined", () => {
                kubernetes.getK8s();
            });
        });
    });

    describe("Methods", () => {
        before(() => {
            clock = sinon.useFakeTimers();
        });

        after(() => {
            clock.restore();
        });

        beforeEach(() => {
            controller = new MockController({});
            kubernetesClientStub = {
                api.v1.watch['events']: {
                    getStream: sinon.stub(),
                },
            };
            kubernetes.getK8s = sinon.stub().returns(kubernetesClientStub);
        });

        describe("init", () => {
            it("should add plugin extensions", () => {
                github.init(controller);
                sinon.assert.calledOnce(controller.addPluginExtension);
                sinon.assert.calledWith(
                    controller.addPluginExtension,
                    "kubernetes",
                    github
                );
            });
        });
        
        describe("watchForEvents", () => {
            it("should watch for added events", () => {

            });
        }
    });
});
