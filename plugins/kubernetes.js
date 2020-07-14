const { KubeConfig } = require("kubernetes-client");
const Client = require("kubernetes-client").Client;
const Request = require("kubernetes-client/backends/request");
let kc;

const kubernetes = {
    name: "Kubernetes",
    init: (controller) => {
        controller.addPluginExtension("kubernetes", kubernetes);
    },
    getK8s: () => {
        if (kc === undefined) {
            const kubeConfig = new KubeConfig();

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
        }
        return kc;
    },
    getNamespaces: async () => {
        let resp = await kubernetes
            .getK8s()
            .api.v1.namespaces("default")
            .pods.get();
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
