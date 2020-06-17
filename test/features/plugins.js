const assert = require("assert");
const sinon = require("sinon");

const path = require("path");

const plugins = require("../../features/plugins");
const pluginOne = require("../data/plugins/one");
const pluginTwo = require("../data/plugins/two");

describe("features / plugins", () => {
    const controller = {
        usePlugin: () => {},
    };

    beforeEach(() => {
        controller.usePlugin = sinon.spy();
    });

    it("should load plugins", () => {
        plugins(controller, path.join(__dirname, "..", "data", "plugins"));

        assert.equal(controller.usePlugin.callCount, 2);
        assert(controller.usePlugin.calledWith(pluginOne));
        assert(controller.usePlugin.calledWith(pluginTwo));
    });

    afterEach(() => {
        sinon.restore();
    });
});
