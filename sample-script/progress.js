const PROGRESS_GAUGE = "Lab Progress";

const PROGRESS_GAUGE_STEPS = {
  1: "Start",
  2: "Step Two",
  3: "Step Three",
  4: "Step Four",
  5: "Finished",
}

module.exports = async (controller) => {
  const botUser = await controller.plugins.slack.whoAmI();

  controller.plugins.help.addCommand(`@${botUser.real_name} progress`, ":stopwatch: Progress", "Show participant's current progress");
  controller.plugins.help.addCommand(`@${botUser.real_name} progress next`, ":stopwatch: Progress Next", "Advance participant to next step");
  controller.plugins.help.addCommand(`@${botUser.real_name} progress back`, ":stopwatch: Progress Back", "Move participant to previous step");

  getProgress = async (user) => {
    let progress = await controller.plugins.storage.getUserGaugeForUser(user, PROGRESS_GAUGE);
    if (!progress) {
      progress = await controller.plugins.storage.setUserGauge(user, PROGRESS_GAUGE, PROGRESS_GAUGE_STEPS[1], 1, 5);
    }
    return progress;
  }

  controller.hears([/^progress$/], ['direct_message', 'direct_mention'], async (bot, message) => {
    console.log("Script progress.js: 'progress' message triggered");

    const progress = await getProgress(message.user);
    await bot.reply(message, {
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: await controller.plugins.participants.getGaugeString(progress),
          }
        }
      ]
    })
  });

  controller.hears([/^progress next$/], ['direct_message', 'direct_mention'], async (bot, message) => {
    console.log("Script progress.js: 'progress next' message triggered");

    const reply = {
      blocks: []
    };

    let progress = await getProgress(message.user);

    if (progress.currentValue === 5) {
      reply.blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: "You are already on the last step",
        }
      });
    } else {
      progress = await controller.plugins.storage.setUserGauge(message.user, PROGRESS_GAUGE, PROGRESS_GAUGE_STEPS[progress.currentValue + 1], progress.currentValue + 1, 5);
      reply.blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: "Good job on progressing to the next step :tada:",
        }
      });
    }

    reply.blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: await controller.plugins.participants.getGaugeString(progress),
      }
    });

    await bot.reply(message, reply);
  });

  controller.hears([/^progress back$/], ['direct_message', 'direct_mention'], async (bot, message) => {
    console.log("Script progress.js: 'progress back' message triggered");

    const reply = {
      blocks: []
    };

    let progress = await getProgress(message.user);

    if (progress.currentValue === 1) {
      reply.blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: "You are already on the first step",
        }
      });
    } else {
      progress = await controller.plugins.storage.setUserGauge(message.user, PROGRESS_GAUGE, PROGRESS_GAUGE_STEPS[progress.currentValue - 1], progress.currentValue - 1, 5);
      reply.blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: "OK let's back up a bit :rewind:",
        }
      });
    }

    reply.blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: await controller.plugins.participants.getGaugeString(progress),
      }
    });

    await bot.reply(message, reply);
  });
}