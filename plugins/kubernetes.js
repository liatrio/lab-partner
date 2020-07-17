const Client = require("kubernetes-client").Client;
const aw = require("awaitify-stream");

let kc;

const kubernetes = {
    name: "Kubernetes",
    init: (controller) => {
        controller.addPluginExtension("kubernetes", kubernetes);
    },
    getK8s: () => {
        const version = "1.13";
        kc = new Client({ version });
        return kc;
    },
    watch: (resource, namespace = "default", callback, queryString = null) => {
        let run = true;
        let stream;

        const watcher = async () => {
            while (run) {
                let k8s;
                if (resource.group === "" || resource.version === "") {
                    k8s = kubernetes.getK8s().api.v1;
                } else {
                    k8s = kubernetes.getK8s().apis[resource.group][
                        resource.version
                    ];
                }
                try {
                    stream = await k8s.watch
                        .namespaces(namespace)
                        [resource.type].getObjectStream(queryString); // eslint-disable-line no-await-in-loop
                } catch (e) {
                    console.log(e);
                }
                let reader = aw.createReader(stream);

                let object;
                const startTime = Date.now();
                try {
                    while (null !== (object = await reader.readAsync())) {
                        const newEventTime = Date.parse(
                            object.object.metadata.creationTimestamp
                        );
                        if (newEventTime > startTime) {
                            callback(object.type, object.object);
                        }
                        if (run === false) {
                            stream.destroy();
                            break;
                        }
                    }
                } catch (e) {
                    console.log(e);
                }
            }
        };
        const result = watcher();

        return () => {
            run = false;
            if (stream) {
                stream.destroy();
                stream = null;
            }
            return result;
        };
    },
};

module.exports = kubernetes;
