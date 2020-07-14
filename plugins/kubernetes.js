const Client = require("kubernetes-client").Client;
const JSONStream = require("json-stream");
let kc;

const kubernetes = {
    name: "Kubernetes",
    init: (controller) => {
        controller.addPluginExtension("kubernetes", kubernetes);
    },
    getK8s: () => {
        if (kc === undefined) {
            const version = "1.13";
            kc = Client({ version });
        }
        return kc;
    },
    watchForEvents: async (namespace) => {
        const stream = kubernetes
            .getK8s()
            .apis.v1.watch.namespaces(namespace)
            .pods.getStream();
        const jsonStream = new JSONStream();
        stream.pipe(jsonStream);
        jsonStream.on("data", (obj) => {
            console.log("Event", JSON.stringify(obj, null, 2));
        });
        return stream;
    },
};

module.exports = kubernetes;
