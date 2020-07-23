const aw = require("awaitify-stream");

class Watch {
    constructor(callback, resource, namespace = "default", query, k8sClient) {
        this.callback = callback;
        this.resource = resource;
        this.namespace = namespace;
        this.query = query;
        this.k8sClient = k8sClient;

        this.run = true;
        this.stream = undefined;
        this.started = undefined;
        this.stopped = undefined;
    }

    start() {
        this.started = new Promise((started) => {
            this.stopped = new Promise((stopped) => {
                const watcher = async () => {
                    do {
                        let k8s;
                        if (!this.resource.group || !this.resource.version) {
                            k8s = this.k8sClient.api.v1;
                        } else {
                            k8s = this.k8sClient.apis[this.resource.group][
                                this.resource.version
                            ];
                        }
                        try {
                            this.stream = await k8s.watch
                                .namespaces(this.namespace)
                                [this.resource.type].getObjectStream(
                                    this.query
                                );
                        } catch (e) {
                            console.log(e);
                        }
                        let reader = aw.createReader(this.stream);

                        let object;
                        const startTime = Date.now();
                        try {
                            started();
                            while (
                                null !== (object = await reader.readAsync())
                            ) {
                                const newEventTime = Date.parse(
                                    object.object.metadata.creationTimestamp
                                );
                                if (
                                    Math.floor(newEventTime / 1000) >=
                                    Math.floor(startTime / 1000)
                                ) {
                                    await this.callback(
                                        object.type,
                                        object.object
                                    );
                                }
                                if (this.run === false) {
                                    break;
                                }
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    } while (this.run);
                    if (!this.stream.destroyed) {
                        this.stream.destroy();
                    }
                    stopped();
                };
                watcher();
            });
        });
        return this.started;
    }

    stop() {
        this.run = false;
        if (this.stream) {
            this.stream.end();
        }
        return this.stopped;
    }
}

module.exports = Watch;
