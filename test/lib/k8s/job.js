const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;
const chance = require("chance").Chance();
const sinon = require("sinon");
const MockKubernetesClient = require("../../mocks/kubernetes");
const Job = require("../../../lib/k8s/job");

describe("lib / job", () => {
    let k8sClient;

    beforeEach(() => {
        k8sClient = new MockKubernetesClient();
        k8sClient.addResource("pods");
        k8sClient.addResource("jobs", "batch", "v1");
    });

    describe("constructor", () => {
        it("initializes new job instance", () => {
            const name = chance.word();
            const resource = {
                metadata: {
                    label: chance.word(),
                },
            };

            const job = new Job(name, resource, k8sClient);

            expect(job.name).to.equal(name);
            expect(job.resource.metadata.name).to.include(name);
            expect(job.resource).to.not.deep.include(resource);
            expect(job.resource.metadata).to.deep.include(resource.metadata);
            expect(job.k8sClient).to.equal(k8sClient);
        });
    });

    describe("start", () => {
        it("creates k8s job", async () => {
            const name = chance.word();
            const resource = {
                metadata: {
                    namespace: chance.word(),
                },
            };
            const expectResponse = { name: chance.word() };
            k8sClient.apis.batch.v1
                .namespaces()
                .jobs.post.resolves({ statusCode: 200, body: expectResponse });

            const job = new Job(name, resource, k8sClient);
            const response = await job.start();

            expect(response).to.equal(expectResponse);
            sinon.assert.calledWith(
                k8sClient.apis.batch.v1.namespaces().jobs.post,
                {
                    body: job.resource,
                }
            );
            sinon.assert.calledWith(
                k8sClient.apis.batch.v1.namespaces,
                resource.metadata.namespace
            );
        });

        it("throws exception on error response", async () => {
            const name = chance.word();
            const resource = {
                metadata: {
                    namespace: chance.word(),
                },
            };
            k8sClient.apis.batch.v1
                .namespaces()
                .jobs.post.resolves({ statusCode: 500, body: {} });

            const job = new Job(name, resource, k8sClient);

            await expect(job.start()).to.be.rejected;
        });
    });

    describe("getJob", () => {
        it("calls get job api", async () => {
            const name = chance.word();
            const resource = {
                metadata: {
                    namespace: chance.word(),
                },
            };
            const expectResponse = { name: chance.word() };
            k8sClient.apis.batch.v1
                .namespaces()
                .jobs.get.resolves({ statusCode: 200, body: expectResponse });

            const job = new Job(name, resource, k8sClient);
            const response = await job.getJob();

            sinon.assert.calledWith(
                k8sClient.apis.batch.v1.namespace,
                resource.metadata.namespace
            );
            sinon.assert.calledWith(
                k8sClient.apis.batch.v1.namespaces().jobs,
                job.resource.metadata.name
            );
            expect(response).to.equal(expectResponse);
        });

        it("throws exception on error response", async () => {
            const name = chance.word();
            const resource = {
                metadata: {
                    namespace: chance.word(),
                },
            };
            k8sClient.apis.batch.v1
                .namespaces()
                .jobs.get.resolves({ statusCode: 500, body: {} });

            const job = new Job(name, resource, k8sClient);

            await expect(job.getJob()).to.be.rejected;
        });
    });

    describe("getJobStatus", () => {
        it("calls get job status api", async () => {
            const name = chance.word();
            const resource = {
                metadata: {
                    namespace: chance.word(),
                    label: chance.word(),
                },
            };
            const expectResponse = { name: chance.word() };
            k8sClient.apis.batch.v1.namespaces().jobs.status.get.resolves({
                statusCode: 200,
                body: expectResponse,
            });

            const job = new Job(name, resource, k8sClient);
            const response = await job.getJobStatus();

            sinon.assert.calledWith(
                k8sClient.apis.batch.v1.namespace,
                resource.metadata.namespace
            );
            sinon.assert.calledWith(
                k8sClient.apis.batch.v1.namespaces().jobs,
                job.resource.metadata.name
            );
            expect(response).to.equal(expectResponse);
        });

        it("throws exception on error response", async () => {
            const name = chance.word();
            const resource = {
                metadata: {
                    namespace: chance.word(),
                    label: chance.word(),
                },
            };
            k8sClient.apis.batch.v1
                .namespaces()
                .jobs.status.get.resolves({ statusCode: 500, body: {} });

            const job = new Job(name, resource, k8sClient);

            await expect(job.getJobStatus()).to.be.rejected;
        });
    });

    describe("getPods", () => {
        it("calls get pods api", async () => {
            const name = chance.word();
            const resource = {
                metadata: {
                    namespace: chance.word(),
                    label: chance.word(),
                },
            };
            const expectResponse = [{ name: chance.word() }];
            k8sClient.api.v1.namespaces().pods.get.resolves({
                statusCode: 200,
                body: { items: expectResponse },
            });

            const job = new Job(name, resource, k8sClient);
            const response = await job.getPods();

            sinon.assert.calledWith(
                k8sClient.api.v1.namespace,
                resource.metadata.namespace
            );
            expect(response).to.equal(expectResponse);
        });

        it("throws exception on error response", async () => {
            const name = chance.word();
            const resource = {
                metadata: {
                    namespace: chance.word(),
                    label: chance.word(),
                },
            };
            k8sClient.api.v1
                .namespaces()
                .pods.get.resolves({ statusCode: 500, body: {} });

            const job = new Job(name, resource, k8sClient);

            await expect(job.getPods()).to.be.rejected;
        });
    });

    describe("getLogs", () => {
        it("calls get pod logs api", async () => {
            const name = chance.word();
            const resource = {
                metadata: {
                    namespace: chance.word(),
                    label: chance.word(),
                },
            };
            const expectResponse = [{ name: chance.word() }];
            k8sClient.api.v1.namespaces().pods.get.resolves({
                statusCode: 200,
                body: { items: [{ metadata: { name: chance.word() } }] },
            });
            k8sClient.api.v1.namespaces().pods.log.get.resolves({
                statusCode: 200,
                body: expectResponse,
            });

            const job = new Job(name, resource, k8sClient);
            const response = await job.getLogs();

            sinon.assert.calledWith(
                k8sClient.api.v1.namespace,
                resource.metadata.namespace
            );
            expect(response).to.deep.equal([expectResponse]);
        });

        it("throws exception on error response", async () => {
            const name = chance.word();
            const resource = {
                metadata: {
                    namespace: chance.word(),
                    label: chance.word(),
                },
            };
            k8sClient.api.v1
                .namespaces()
                .pods.log.get.resolves({ statusCode: 500, body: {} });

            const job = new Job(name, resource, k8sClient);

            await expect(job.getLogs()).to.be.rejected;
        });
    });

    describe("destroy", () => {
        it("calls delete job api", async () => {
            const name = chance.word();
            const resource = {
                metadata: {
                    namespace: chance.word(),
                    label: chance.word(),
                },
            };
            const expectResponse = [{ name: chance.word() }];
            k8sClient.apis.batch.v1.namespaces().jobs.delete.resolves({
                statusCode: 200,
                body: expectResponse,
            });

            const job = new Job(name, resource, k8sClient);
            const response = await job.destroy();

            sinon.assert.calledWith(
                k8sClient.apis.batch.v1.namespaces,
                resource.metadata.namespace
            );
            expect(response).to.equal(expectResponse);
        });

        it("throws exception on error response", async () => {
            const name = chance.word();
            const resource = {
                metadata: {
                    namespace: chance.word(),
                    label: chance.word(),
                },
            };
            k8sClient.apis.batch.v1
                .namespaces()
                .jobs.delete.resolves({ statusCode: 500, body: {} });

            const job = new Job(name, resource, k8sClient);

            await expect(job.destroy()).to.be.rejected;
        });
    });
});
