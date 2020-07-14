var JSONStream = require("json-stream");
const aw = require("./awaitify-stream.js");

/**
 * Helper method for watching resources
 * */
module.exports = (apiClient) => {
    let run;
    let stream;

    return {
        start: async (resource, namespace, callback, queryString = null) => {
            run = true;
            do {
                try {
                    /*
                     * Deprecation warning on these lines, require changing to
                     * getObjectStream. However this change breaks the watch solution to
                     * restart watches on exit. Will require more work to fix, so I'm
                     * leaving it for now. -Alice
                     */
                    if (namespace === "") {
                        stream = await apiClient.api.v1.watch[
                            resource
                        ].getStream(queryString); // eslint-disable-line no-await-in-loop
                    } else {
                        stream = await apiClient.api.v1.watch
                            .namespaces(namespace)
                            [resource].getStream(queryString); // eslint-disable-line no-await-in-loop
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

                jsonStream.destroy();
                stream.destroy();
                stream = null;
            } while (run);
        },

        stop: () => {
            run = false;
            if (stream) {
                stream.destroy();
                stream = null;
            }
        },
    };
};
