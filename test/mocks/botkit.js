class MockBotkit {
    constructor(controller) {
        this.controller = controller;
        this.BotkitConversation = BotkitConversation;
    }

    spawn() {
        return this.controller.bot;
    }
}

class BotkitConversation {
    constructor(dialogId, controller) {
        this.dialogId = dialogId;
        this.controller = controller;
    }

    async ask(response, callback /*, key */) {
        this.controller.reply("Thread", [], response);
        await callback(this.controller.userReply);
    }
}

module.exports = MockBotkit;
