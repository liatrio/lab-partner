// const sinon = require("sinon");
// const expect = require("chai").expect;
// const chance = require("chance").Chance();
//
// const MockController = require("../mocks/controller");
//
// const kubernetes = require("../../plugins/kubernetes");

// describe("plugins / kubernetes", () => {
//     let controller;
//     let kubernetesClientStub;
//     let clock;
//
//     describe("Setup", () => {
//         describe("getKubernetesClient", () => {
//             it("should return without error", () => {
//                 kubernetes.getK8s();
//             });
//         });
//     });
//
//     // describe("Methods", () => {
//     //     before(() => {
//     //         clock = sinon.useFakeTimers();
//     //     });
//
//     //     after(() => {
//     //         clock.restore();
//     //     });
//
//     //     beforeEach(() => {
//     //         controller = new MockController({});
//     //         kubernetesClientStub = {};
//     //         kubernetes.getK8s = sinon.stub().returns(kubernetesClientStub);
//     //     });
//
//     //     describe("init", () => {
//     //         it("should add plugin extensions", () => {
//     //             github.init(controller);
//     //             sinon.assert.calledOnce(controller.addPluginExtension);
//     //             sinon.assert.calledWith(
//     //                 controller.addPluginExtension,
//     //                 "kubernetes",
//     //                 github
//     //             );
//     //         });
//     //     });
//
//     //     describe("watchForEvents", () => {
//     //         it("should watch for added events", () => {
//     //             // Create a stub for getStream()
//     //             const kubeApi = {
//     //                 client: kubernetes.getK8s(),
//     //                 group: "api",
//     //                 version: "v1"
//     //             };
//
//     //             // Create a stream and push mock events into it
//     //             //
//     //             // resolve getStream with mock response()
//     //         });
//     //     }
//     // );
// });
