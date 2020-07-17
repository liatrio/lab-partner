const sinon = require("sinon");
//const expect = require("chai").expect;
//const chance = require("chance").Chance();
const { Readable } = require("stream");
var JSONStream = require("json-stream");

//const MockController = require("../mocks/controller");

const kubernetes = require("../../plugins/kubernetes");

describe("plugins / kubernetes", () => {
    //let controller;

    //describe("Setup", () => {
    //    describe("getKubernetesClient", () => {
    //        it("should return without error", () => {
    //            kubernetes.getK8s();
    //        });
    //    });
    //});

    beforeEach(() => {
        this.stream = new Readable({ read() {} });
        const apiWatchResources = [];
        apiWatchResources["event"] = {
            getObjectStream: sinon.stub(),
        };
        const client = {
            api: {
                v1: {
                    watch: {
                        namespaces() {
                            return apiWatchResources;
                        },
                    },
                },
            },
        };

        this.callback = sinon.spy();
        const jsonStream = new JSONStream();
        this.stream.pipe(jsonStream);
        client.api.v1.watch
            .namespaces()
            ["event"].getObjectStream.resolves(jsonStream);
        kubernetes.getK8s = sinon.stub().returns(client);
    });

    // describe("init", () => {
    //     it("should add plugin extensions", () => {
    //         github.init(controller);
    //         sinon.assert.calledOnce(controller.addPluginExtension);
    //         sinon.assert.calledWith(
    //             controller.addPluginExtension,
    //             "kubernetes",
    //             kubernetes
    //         );
    //     });
    // });

    it("watching: do not skip initial resources", () => {
        const myCall = (type, object) => {
            console.log("Type", type);
            console.log("Object", object);
        };
        const cb = sinon.spy(myCall);
        const kubeResource = {
            type: "event",
            resource: "",
            group: "",
        };
        const stop = kubernetes.startWatch(
            kubeResource,
            "test-namespace",
            myCall
        );
        const testObject =
            '{"type": "ADDED", "object": {"metadata": {"creationTimestamp": "2020-07-16T18:44:46Z"}}}';
        this.stream.push(testObject);
        stop();
        setImmediate(() => {
            sinon.assert.called(cb);
        });
    });
});
