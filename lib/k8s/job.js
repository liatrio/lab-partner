const merge = require("deepmerge");

class Job {
    constructor(name, resource, k8sClient) {
        this.name = name;
        this.resource = merge(
            {
                apiVersion: "batch/v1",
                kind: "Job",
                metadata: {
                    name: `lab-partner-${name}-${new Date().getTime()}`,
                    namespace: "default",
                },
                spec: {
                    ttlSecondsAfterFinished: 100,
                    backoffLimit: 0,
                    template: {
                        spec: {
                            restartPolicy: "Never",
                            containers: [],
                        },
                    },
                },
            },
            resource
        );
        this.k8sClient = k8sClient;
    }
    async start() {
        const response = await this.k8sClient.apis.batch.v1
            .namespaces(this.resource.metadata.namespace)
            .jobs.post({ body: this.resource });
        if (response.statusCode < 200 || response.statusCode > 299) {
            throw { message: "Error creating job", response };
        }
        return response.body;
    }
    async getJob() {
        const response = await this.k8sClient.apis.batch.v1
            .namespaces(this.resource.metadata.namespace)
            .jobs(this.resource.metadata.name)
            .get();
        if (response.statusCode < 200 || response.statusCode > 299) {
            throw { message: "Error getting job", response };
        }
        return response.body;
    }
    async getJobStatus() {
        const response = await this.k8sClient.apis.batch.v1
            .namespaces(this.resource.metadata.namespace)
            .jobs(this.resource.metadata.name)
            .status.get();
        if (response.statusCode < 200 || response.statusCode > 299) {
            throw { message: "Error getting job status", response };
        }
        return response.body;
    }
    async getPods() {
        const response = await this.k8sClient.api.v1
            .namespaces(this.resource.metadata.namespace)
            .pods.get({
                qs: {
                    labelSelector: `job-name=${this.resource.metadata.name}`,
                },
            });
        if (response.statusCode < 200 || response.statusCode > 299) {
            throw { message: "Error getting job pods", response };
        }
        return response.body.items;
    }
    async getLogs() {
        const pods = await this.getPods();
        const logs = pods.map(async (pod) => {
            const response = await this.k8sClient.api.v1
                .namespaces(this.resource.metadata.namespace)
                .pods(pod.metadata.name)
                .log.get();
            if (response.statusCode < 200 || response.statusCode > 299) {
                throw {
                    message: "Error getting job pods logs",
                    response,
                };
            }
            return response.body;
        });
        return Promise.all(logs);
    }
    async destroy() {
        const response = await this.k8sClient.apis.batch.v1
            .namespaces(this.resource.metadata.namespace)
            .jobs(this.resource.metadata.name)
            .delete({ qs: { propagationPolicy: "Foreground" } });
        if (response.statusCode < 200 || response.statusCode > 299) {
            throw { message: "Error getting job pods logs", response };
        }
        return response.body;
    }
}

module.exports = Job;
