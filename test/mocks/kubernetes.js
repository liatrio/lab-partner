const { Readable } = require("stream");

module.exports = {
    addGroup: (client, group) => {
        const names = ["event"];
        const namesPlural = ["event"];
        const apiResources = {};
        const apiWatchResources = {};
        names.forEach((name) => {
            apiResources[name] = {
                getStream() {
                    const stream = new Readable({ read() {} });
                    return Promise.resolve(stream);
                },
                getObjectStream() {
                    const stream = new Readable({ read() {} });
                    return Promise.resolve(stream);
                },
                get() {
                    return Promise.resolve({});
                },
                patch() {
                    return Promise.resolve({});
                },
            };
            apiWatchResources[name] = {
                getStream() {
                    const stream = new Readable({ read() {} });
                    return Promise.resolve(stream);
                },
                getObjectStream() {
                    const stream = new Readable({ read() {} });
                    return Promise.resolve(stream);
                },
                get() {
                    return Promise.resolve({});
                },
                patch() {
                    return Promise.resolve({});
                },
            };
        });
        namesPlural.forEach((name) => {
            apiResources[name] = () => ({
                getStream() {
                    const stream = new Readable({ read() {} });
                    return Promise.resolve(stream);
                },
                getObjectStream() {
                    const stream = new Readable({ read() {} });
                    return Promise.resolve(stream);
                },
                get() {
                    return Promise.resolve({});
                },
                patch() {
                    return Promise.resolve({});
                },
            });
            apiWatchResources[name] = {
                getStream() {
                    const stream = new Readable({ read() {} });
                    return Promise.resolve(stream);
                },
                getObjectStream() {
                    const stream = new Readable({ read() {} });
                    return Promise.resolve(stream);
                },
                get() {
                    return Promise.resolve({});
                },
                patch() {
                    return Promise.resolve({});
                },
            };
        });
        client.api = {
            v1: {
                namespaces() {
                    return apiResources;
                },
                watch: {
                    namespaces() {
                        return apiWatchResources;
                    },
                },
            },
        };
        client.apis = {};
        client.apis[group] = {
            v1: {
                namespaces() {
                    return apiResources;
                },
                watch: {
                    namespaces() {
                        return apiWatchResources;
                    },
                },
            },
        };
    },
};
