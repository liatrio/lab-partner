const path = require("path");
const fs = require("fs");

module.exports = (controller, pluginsPath) => {
    if (!pluginsPath) {
        pluginsPath = path.join(__dirname, "..", "plugins");
    }
    let files;
    try {
        files = fs.readdirSync(pluginsPath);
    } catch (error) {
        console.error(`Unable to scan plugin folder ${pluginsPath}: ${error}`);
        return;
    }
    files.forEach((file) => {
        let plugin = require(path.join(pluginsPath, file));
        controller.usePlugin(plugin);
    });
};
