const Client = require("kubernetes-client").Client;

const Job = require("../lib/k8s/job");
const Watch = require("../lib/k8s/watch");

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
    newJob: (name, resource) => {
        return new Job(name, resource, kubernetes.getK8s());
    },
    newWatch: (callback, resource, namespace = "default", query = null) => {
        return new Watch(
            callback,
            resource,
            namespace,
            query,
            kubernetes.getK8s()
        );
    },
};

module.exports = kubernetes;
