const Client = require("kubernetes-client").Client;
//const JSONStream = require("json-stream");
const aw = require("awaitify-stream");

let kc;

const kubernetes = {
    name: "Kubernetes",
    init: (controller) => {
        controller.addPluginExtension("kubernetes", kubernetes);
    },
    getK8s: () => {
        if (kc === undefined) {
            const version = "1.13";
            kc = new Client({ version });
        }
        return kc;
    },
    startWatch: (resource, namespace, callback, queryString = null) => {
        let run = true;
        let stream;

        const watcher = async () => {
            do {
                try {
                    let k8s;
                    if (resource.group === "" || resource.version === "") {
                        k8s = kubernetes.getK8s().api.v1;
                    } else {
                        k8s = kubernetes.getK8s().apis[resource.group][
                            resource.version
                        ];
                    }
                    try {
                        if (namespace === "") {
                            stream = await k8s.watch[
                                resource.type
                            ].getObjectStream(queryString); // eslint-disable-line no-await-in-loop
                        } else {
                            stream = await k8s.watch
                                .namespaces(namespace)
                                [resource.type].getObjectStream(queryString); // eslint-disable-line no-await-in-loop
                        }
                    } catch (e) {
                        console.log(e);
                    }

                    let reader = aw.createReader(stream);

                    let object;
                    const startTime = Date.now();
                    while (null !== (object = await reader.readAsync())) {
                        const newEventTime = Date.parse(
                            object.object.metadata.creationTimestamp
                        );
                        if (newEventTime < startTime) {
                            console.log("Hi");
                            callback(object.type, object.object);
                        }
                    }
                } catch (e) {
                    console.log(e);
                }
            } while (run);
        };
        watcher();

        return () => {
            run = false;
            if (stream) {
                stream.destroy();
                stream = null;
                console.log("Stream destroyed");
            }
        };
    },
};

module.exports = kubernetes;
