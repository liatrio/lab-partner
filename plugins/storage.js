const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI);

const userDetailSchema = new mongoose.Schema({
    userId: String,
    name: String,
    value: String,
});
userDetailSchema.index({ userId: 1, name: 1 }, { unique: true });
const UserDetail = mongoose.model("UserDetail", userDetailSchema);

const userLinkSchema = new mongoose.Schema({
    userId: String,
    name: String,
    url: String,
});
userLinkSchema.index({ userId: 1, name: 1 }, { unique: true });
const UserLink = mongoose.model("UserLink", userLinkSchema);

const userGaugeSchema = new mongoose.Schema({
    userId: String,
    name: String,
    currentName: String,
    currentValue: Number,
    maxValue: Number,
});
userGaugeSchema.index({ userId: 1, name: 1 }, { unique: true });
const UserGauge = mongoose.model("UserGauge", userGaugeSchema);

module.exports = (controller) => {
    const storage = {
        name: "Storage",
        init: () => {
            controller.addPluginExtension("storage", storage);
        },

        async setUserDetail(userId, name, value) {
            return UserDetail.findOneAndUpdate(
                { userId, name },
                { value },
                { new: true, upsert: true }
            ).exec();
        },
        async getUserDetails() {
            return UserDetail.find().exec();
        },
        async getUserDetailsForUser(userId) {
            return UserDetail.find({ userId }).exec();
        },
        async getUserDetailForUser(userId, name) {
            return UserDetail.findOne({ userId, name }).exec();
        },

        async setUserGauge(userId, name, currentName, currentValue, maxValue) {
            return UserGauge.findOneAndUpdate(
                { userId, name },
                { currentName, currentValue, maxValue },
                { new: true, upsert: true }
            ).exec();
        },
        async getUserGauges() {
            return UserGauge.find().exec();
        },
        async getUserGaugesForUser(userId) {
            return UserGauge.find({ userId }).exec();
        },
        async getUserGaugeForUser(userId, name) {
            return UserGauge.findOne({ userId, name }).exec();
        },

        async setUserLink(userId, name, url) {
            return UserLink.findOneAndUpdate(
                { userId, name },
                { url },
                { new: true, upsert: true }
            ).exec();
        },
        async getUserLinks() {
            return UserLink.find().exec();
        },
        async getUserLinksForUser(userId) {
            return UserLink.find({ userId }).exec();
        },
        async getUserLinkForUser(userId, name) {
            return UserLink.findOne({ userId, name }).exec();
        },
    };

    return storage;
};
