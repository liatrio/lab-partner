//const { KubeConfig } = require("kubernetes-client");
const Client = require("kubernetes-client").Client;
//const Request = require("kubernetes-client/backends/request");
//const config = require("kubernetes-client/backends/request").config;
let client;

const kubernetes = {
    name: "Kubernetes",
    init: (controller) => {
        controller.addPluginExtension("kubernetes", kubernetes);
    },
    getK8s: () => {
        if (client === undefined) {
            const version = "1.13";
            const client = new Client({
                version: version,
            });
            /*
            if (process.env.KUBECONFIG) {
                kubeConfig.loadFromDefault();
            } else {
                kubeConfig.loadFromCluster();
            }
            const backend = kubeConfig ? new Request(kubeConfig) : undefined;
            const version = "1.13";
            kc = backend
                ? new Client({ backend, version })
                : new Client({ version });
            */
            return client;
        }
        return client;
    },
    getPods: async () => {
        let resp = await kubernetes.getK8s().api.v1.namespaces.get();
        console.log(resp);
    },
    // watchForEvents: async (namespace, callback) => {
    //     let lastEventList = [];
    //     let resp = await kubernetes
    //         .getK8s()
    //         .api.v1.namespaces(namespace)
    //         .events.get();
    //     // Check for events
    //     const interval = setInterval(async () => {

    //     }, 60000);
    // },
};

module.exports = kubernetes;
