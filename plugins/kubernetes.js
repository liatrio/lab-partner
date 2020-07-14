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
        try {
            if (namespace === "") {
                stream = await kubernetes.getK8s().api.v1.watch['events'].getStream();
            } else {
                stream = await kubernetes.getK8s().api.v1.watch.namespaces(namespace)['events'].getStream();
            }
        } catch (e) {
            console.log(e);
        }
        const jsonStream = new JSONStream();
        stream.pipe(jsonStream);
        let reader = aw.createReader(jsonStream);

        let object;
        let result;

        while (null !== (object = await reader.readAsync())) {
            if (object.type === "ADDED" || object.type === "MODIFIED") {
                result = await callback(object.type, object.object);
                if (result === false && stream !== null) {
                    stream.destroy();
                    stream = null;
                }
            }
        }

        return stream.destroy();
    },
};

module.exports = kubernetes;
