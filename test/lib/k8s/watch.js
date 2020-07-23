const sinon = require("sinon");
const expect = require("chai").expect;
const chance = require("chance").Chance();
const { Transform } = require("stream");
const JSONStream = require("json-stream");

const Watch = require("../../../lib/k8s/watch");

describe("lib / watch", () => {
    beforeEach(() => {});

    describe("constructor", () => {
        it("initializes new watch instance", () => {
            const callback = sinon.spy();
            const resource = {};
            const namespace = chance.word();
            const query = {};
            const k8sClient = {};

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
        beforeEach(() => {
            this.namespace = chance.word();
            this.query = {};
            this.stream = new Transform({ read() {} });
            this.jsonStream = new JSONStream();
            this.stream.pipe(this.jsonStream);
            this.resourceApi = {
                getObjectStream: sinon.stub().resolves(this.jsonStream),
            };
            this.resourceGroupApi = {
                watch: {
                    namespaces: sinon.stub(),
                },
            };
            this.k8sClient = {
                api: {
                    v1: this.resourceGroupApi,
                },
                apis: {},
            };
        });

        it("detects new resource (no api group)", async () => {
            const callback = sinon.spy();
            const resource = {
                type: chance.word,
            };

            const testObject = {
                type: "ADDED",
                object: {
                    metadata: {
                        creationTimestamp: "3000-07-16T18:44:46Z",
                    },
                },
            };

            const resourceApi = {};
            resourceApi[resource.type] = this.resourceApi;
            this.k8sClient.api.v1.watch.namespaces
                .withArgs(this.namespace)
                .returns(resourceApi);

            const watch = new Watch(
                callback,
                resource,
                this.namespace,
                this.query,
                this.k8sClient
            );

            await watch.start();
            this.stream.push(JSON.stringify(testObject));
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

            this.k8sClient.apis[resource.group] = {};
            this.k8sClient.apis[resource.group][
                resource.version
            ] = this.resourceGroupApi;
            const resourceApi = {};
            resourceApi[resource.type] = this.resourceApi;
            this.k8sClient.apis[resource.group][
                resource.version
            ].watch.namespaces
                .withArgs(this.namespace)
                .returns(resourceApi);

            const watch = new Watch(
                callback,
                resource,
                this.namespace,
                this.query,
                this.k8sClient
            );

            await watch.start();
            this.stream.push(JSON.stringify(testObject));
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

            const resourceApi = {};
            resourceApi[resource.type] = this.resourceApi;
            this.k8sClient.api.v1.watch.namespaces
                .withArgs(this.namespace)
                .returns(resourceApi);

            const watch = new Watch(
                callback,
                resource,
                this.namespace,
                this.query,
                this.k8sClient
            );

            await watch.start();
            this.stream.push(JSON.stringify(testObject));
            await watch.stop();
            sinon.assert.notCalled(callback);
        });
    });
});
