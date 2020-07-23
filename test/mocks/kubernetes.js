const { Transform } = require("stream");
const sinon = require("sinon");

class KubernetesClient {
    constructor(resources) {
        this.api = {
            v1: this.createGroup(),
        };
        this.apis = {};
        resources.forEach((resource) => {
            this.addResource(resource.name, resource.group, resource.version);
        });
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

        // return {
        //     getStream() {
        //         const stream = new Transform({ read() {} });
        //         return Promise.resolve(stream);
        //     },
        //     getObjectStream() {
        //         const stream = new Readable({ read() {} });
        //         return Promise.resolve(stream);
        //     },
        //     get() {
        //         return Promise.resolve({});
        //     },
        //     patch() {
        //         return Promise.resolve({});
        //     },
        // }
    }
}

// module.exports = {
//     addGroup: (client, group) => {
//         const names = ["event"];
//         const namesPlural = ["event"];
//         const apiResources = {};
//         const apiWatchResources = {};
//         names.forEach((name) => {
//             apiResources[name] = {
//                 getStream() {
//                     const stream = new Readable({ read() {} });
//                     return Promise.resolve(stream);
//                 },
//                 getObjectStream() {
//                     const stream = new Readable({ read() {} });
//                     return Promise.resolve(stream);
//                 },
//                 get() {
//                     return Promise.resolve({});
//                 },
//                 patch() {
//                     return Promise.resolve({});
//                 },
//             };
//             apiWatchResources[name] = {
//                 getStream() {
//                     const stream = new Readable({ read() {} });
//                     return Promise.resolve(stream);
//                 },
//                 getObjectStream() {
//                     const stream = new Readable({ read() {} });
//                     return Promise.resolve(stream);
//                 },
//                 get() {
//                     return Promise.resolve({});
//                 },
//                 patch() {
//                     return Promise.resolve({});
//                 },
//             };
//         });
//         namesPlural.forEach((name) => {
//             apiResources[name] = () => ({
//                 getStream() {
//                     const stream = new Readable({ read() {} });
//                     return Promise.resolve(stream);
//                 },
//                 getObjectStream() {
//                     const stream = new Readable({ read() {} });
//                     return Promise.resolve(stream);
//                 },
//                 get() {
//                     return Promise.resolve({});
//                 },
//                 patch() {
//                     return Promise.resolve({});
//                 },
//             });
//             apiWatchResources[name] = {
//                 getStream: sinon.stub().resolves(Readable({ read() {} })),
//                 getObjectStream() {
//                     const stream = new Readable({ read() {} });
//                     return Promise.resolve(stream);
//                 },
//                 get() {
//                     return Promise.resolve({});
//                 },
//                 patch() {
//                     return Promise.resolve({});
//                 },
//             };
//         });
//         client.api = {
//             v1: {
//                 namespaces() {
//                     return apiResources;
//                 },
//                 watch: {
//                     namespaces() {
//                         return apiWatchResources;
//                     },
//                 },
//             },
//         };
//         client.apis = {};
//         client.apis[group] = {
//             v1: {
//                 namespaces() {
//                     return apiResources;
//                 },
//                 watch: {
//                     namespaces() {
//                         return apiWatchResources;
//                     },
//                 },
//             },
//         };
//     },
// };
module.exports = KubernetesClient;
