const Client = require("kubernetes-client").Client;
const Watch = require("./watch");

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
    watchForEvents: async (namespace, callback) => {
        const watch = Watch(kubernetes.getK8s());
        watch.start("events", namespace, callback, "api", "v1", null);
        return watch.stop();
    },
};

module.exports = kubernetes;
