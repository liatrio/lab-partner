const sinon = require("sinon");
const expect = require("chai").expect;
const chance = require("chance").Chance();
const { Transform } = require("stream");
const JSONStream = require("json-stream");

const MockKubernetesClient = require("../../mocks/kubernetes");
const Watch = require("../../../lib/k8s/watch");

describe("lib / watch", () => {
    let k8sClient;
    beforeEach(() => {
        k8sClient = new MockKubernetesClient();
    });

    describe("constructor", () => {
        it("initializes new watch instance", () => {
            const callback = sinon.spy();
            const resource = {};
            const namespace = chance.word();
            const query = {};

            const watch = new Watch(
                callback,
                resource,
                namespace,
                query,
                k8sClient
            );

            expect(watch.callback).to.equal(callback);
            expect(watch.resource).to.equal(resource);
            expect(watch.namespace).to.equal(namespace);
            expect(watch.query).to.equal(query);
            expect(watch.k8sClient).to.equal(k8sClient);
        });
    });

    describe("watch instance", () => {
        let namespace;
        let query;
        let stream;
        let jsonStream;

        beforeEach(() => {
            namespace = chance.word();
            query = {};
            stream = new Transform({ read() {} });
            jsonStream = new JSONStream();
            stream.pipe(jsonStream);
        });

        it("detects new resource (no api group)", async () => {
            const callback = sinon.spy();
            const resource = {
                type: chance.word(),
            };

            const testObject = {
                type: "ADDED",
                object: {
                    metadata: {
                        creationTimestamp: "3000-07-16T18:44:46Z",
                    },
                },
            };

            k8sClient.addResource(resource.type);
            k8sClient.api.v1.watch
                .namespaces()
                [resource.type].getObjectStream.resolves(jsonStream);

            const watch = new Watch(
                callback,
                resource,
                namespace,
                query,
                k8sClient
            );

            await watch.start();
            stream.push(JSON.stringify(testObject));
            await watch.stop();
            sinon.assert.called(callback);
        });

        it("detects new resource (with api group)", async () => {
            const callback = sinon.spy();

            const resource = {
                type: chance.word(),
                version: chance.word(),
                group: chance.word(),
            };

            const testObject = {
                type: "ADDED",
                object: {
                    metadata: {
                        creationTimestamp: "3000-07-16T18:44:46Z",
                    },
                },
            };

            k8sClient.addResource(
                resource.type,
                resource.group,
                resource.version
            );
            k8sClient.apis[resource.group][resource.version].watch
                .namespaces()
                [resource.type].getObjectStream.resolves(jsonStream);

            const watch = new Watch(
                callback,
                resource,
                namespace,
                query,
                k8sClient
            );

            await watch.start();
            stream.push(JSON.stringify(testObject));
            await watch.stop();
            sinon.assert.called(callback);
        });

        it("ignores old resources", async () => {
            const callback = sinon.spy();

            const resource = {
                type: chance.word(),
            };

            const testObject = {
                type: "ADDED",
                object: {
                    metadata: {
                        creationTimestamp: "1991-07-16T18:44:46Z",
                    },
                },
            };

            k8sClient.addResource(resource.type);
            k8sClient.api.v1.watch
                .namespaces()
                [resource.type].getObjectStream.resolves(jsonStream);

            const watch = new Watch(
                callback,
                resource,
                namespace,
                query,
                k8sClient
            );

            await watch.start();
            stream.push(JSON.stringify(testObject));
            await watch.stop();
            sinon.assert.notCalled(callback);
        });
    });
});
