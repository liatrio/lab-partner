const sinon = require("sinon");
const { Readable } = require("stream");
const JSONStream = require("json-stream");
const MockController = require("../mocks/controller");
const K8sHelper = require("../mocks/kubernetes");
const { Client } = require("kubernetes-client");

const kubernetes = require("../../plugins/kubernetes");

describe("plugins / kubernetes", () => {
    let controller;

    describe("Setup", () => {
        describe("getKubernetesClient", () => {
            it("should return without error", () => {
                kubernetes.getK8s();
            });
        });
    });

    describe("Methods", () => {
        beforeEach(() => {
            controller = new MockController({});
            this.stream = new Readable({ read() {} });
            this.client = new Client({ backend: {}, version: "1.13" });
            K8sHelper.addGroup(this.client, "events.k8s.io");

            this.callback = sinon.spy();
            const jsonStream = new JSONStream();
            this.stream.pipe(jsonStream);
            this.getObjectStream = sinon.stub(
                this.client.api.v1.watch.namespaces().event,
                "getObjectStream"
            );
            this.getObjectStream.resolves(jsonStream);
            kubernetes.getK8s = sinon.stub().returns(this.client);
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

        it("watching: detect new events", async () => {
            const cb = sinon.spy();
            const kubeResource = {
                type: "event",
                resource: "",
                group: "",
            };

            const testObject = {
                type: "ADDED",
                object: {
                    metadata: {
                        creationTimestamp: "3000-07-16T18:44:46Z",
                    },
                },
            };

            const stop = kubernetes.watch(kubeResource, "test-namespace", cb);
            this.stream.push(JSON.stringify(testObject));
            await stop();
            sinon.assert.called(cb);
        });
        it("watching: handle specified resources", async () => {
            const cb = sinon.spy();
            const kubeResource = {
                type: "event",
                version: "v1",
                group: "events.k8s.io",
            };

            const testObject = {
                type: "ADDED",
                object: {
                    metadata: {
                        creationTimestamp: "3000-07-16T18:44:46Z",
                    },
                },
            };

            const stop = kubernetes.watch(kubeResource, "test-namespace", cb);
            this.stream.push(JSON.stringify(testObject));
            await stop();
            sinon.assert.called(cb);
        });
        it("watching: filter old resources", async () => {
            const cb = sinon.spy();
            const kubeResource = {
                type: "event",
                version: "",
                group: "",
            };
            const testObject = {
                type: "ADDED",
                object: {
                    metadata: {
                        creationTimestamp: "1991-07-16T18:44:46Z",
                    },
                },
            };

            const stop = kubernetes.watch(kubeResource, "test-namespace", cb);
            this.stream.push(JSON.stringify(testObject));
            await stop();
            sinon.assert.notCalled(cb);
        });
    });
});
