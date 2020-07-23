const { Transform } = require("stream");
const sinon = require("sinon");

class KubernetesClient {
    constructor() {
        this.api = {
            v1: this.createGroup(),
        };
        this.apis = {};
    }

    addResource(name, group = null, version = "v1") {
        let target;
        if (!group) {
            target = this.api.v1;
        } else {
            if (this.apis[group] === undefined) {
                this.apis[group] = {};
            }
            if (this.apis[group][version] === undefined) {
                this.apis[group][version] = this.createGroup();
            }
            target = this.apis[group][version];
        }
        const resource = this.createResource();
        target._resources[name] = sinon.stub();
        target._resources[name].returns(resource);
        for (const property in resource) {
            target._resources[name][property] = resource[property];
        }
    }

    createGroup() {
        const group = {
            _resources: {},
            namespaces: sinon.stub(),
            watch: {
                namespaces: sinon.stub(),
            },
        };
        group.namespaces.returns(group._resources);
        group.namespace = group.namespaces;
        group.watch.namespaces.returns(group._resources);
        group.watch.namespace = group.namespaces;
        return group;
    }

    createResource() {
        const resource = {
            getObjectStream: sinon.stub(),
            get: sinon.stub(),
            post: sinon.stub(),
            put: sinon.stub(),
            patch: sinon.stub(),
            delete: sinon.stub(),
            log: { get: sinon.stub() },
            status: { get: sinon.stub() },
        };
        resource.getObjectStream.resolves(new Transform({ read() {} }));
        resource.getStream = resource.getObjectStream;
        resource.get.resolves({ statusCode: 404, body: {} });
        resource.post.resolves({ statusCode: 400, body: {} });
        resource.put.resolves({ statusCode: 400, body: {} });
        resource.patch.resolves({ statusCode: 400, body: {} });
        resource.delete.resolves({ statusCode: 400, body: {} });
        resource.log.get.resolves({ statusCode: 400, body: {} });
        resource.status.get.resolves({ statusCode: 400, body: {} });
        return resource;
    }
}

module.exports = KubernetesClient;
