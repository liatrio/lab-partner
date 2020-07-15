const Client = require("kubernetes-client").Client;
const JSONStream = require("json-stream");
const aw = require("awaitify-stream");

let kc;
let stream;
let run;

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
    startWatch: async (resource, namespace, callback, queryString = null) => {
        run = true;
        do {
            try {
                let k8s;
                console.log("Resource", resource);
                if (resource.group === "" || resource.version === "") {
                    k8s = kubernetes.getK8s().api.v1;
                } else {
                    k8s = kubernetes.getK8s().apis[resource.group][
                        resource.version
                    ];
                }
                try {
                    if (namespace === "") {
                        stream = await k8s.watch[resource.type].getStream(
                            queryString
                        ); // eslint-disable-line no-await-in-loop
                    } else {
                        stream = await k8s.watch
                            .namespaces(namespace)
                            [resource.type].getStream(queryString); // eslint-disable-line no-await-in-loop
                    }
                } catch (e) {
                    console.log(e);
                }

                const jsonStream = new JSONStream();
                stream.pipe(jsonStream);
                let reader = aw.createReader(jsonStream);

                let object;
                while (null !== (object = await reader.readAsync())) {
                    if (object.type === "ADDED" || object.type === "MODIFIED") {
                        console.log(run);
                        callback(object.type, object.object);
                    }
                }
            } catch (e) {
                console.log(e);
            }
        } while (run);
    },
    stopWatch: () => {
        run = false;
        if (stream) {
            stream.abort();
            stream = null;
        }
    },
};

module.exports = kubernetes;
