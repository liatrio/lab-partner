const K8sConfig = require('kubernetes-client/backends/request').config
const Client = require('kubernetes-client').Client;
let kc;


const kubernetes = {
    name: "Kubernetes",
    init: (controller) => {
        controller.addPluginExtension("kubernetes", kubernetes);
    },
    getK8s: () => {
        if (kc === undefined) {
            const version = '1.13';
            kc = new Client({version});
        }
        return k8s;
    },
    watchForEvents: async (namespace, callback) => {
        let lastEventList = [];
        let resp = await kubernetes
            .getK8s()
            .api.v1.namespaces(namespace)
            .events.get();
        let lastEventList = resp.data
        // Check for events
        const interval = setInterval(async () => {}, 60000);
    },
};

module.exports = kubernetes;
