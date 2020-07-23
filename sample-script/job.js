module.exports = async (controller) => {
  const botUser = await controller.plugins.slack.whoAmI();

  controller.plugins.help.addCommand(`${botUser.real_name} run job`, ":athletic_shoe: Run test job", "Runs a test job and watches progress to demonstrate Kubernetes watch and run feature.");

  controller.hears(/^run job$/, ["direct_mention", "direct_message"], async (bot, message) => {
    console.log("Script job.js: Start Job");

    const job = controller.plugins.kubernetes.newJob("test", {
      spec: {
        template: {
          spec: {
            containers: [
              {
                name: "job",
                image: "node",
                command: ["node", "-e", "setTimeout(() => { console.log('{result: \"success\", logs: \"hello\"}') }, 3000)"],
              }
            ]                
          }
        }
      }
    });

    let lastPhase;

    try {
      const watch = controller.plugins.kubernetes.newWatch(
        async (eventType, resource) => {
          const bot = await controller.spawn(process.env.TEAM);
          await bot.startConversationInChannel(message.channel, message.user);
          switch (eventType) {
            case "ADDED":
              await bot.say(`Pod ${resource.metadata.name} created`);
              break;
            case "MODIFIED":
              if (lastPhase !== resource.status.phase) {
                await bot.say(`Pod ${resource.metadata.name} is ${resource.status.phase}`);
                if (resource.status.phase === "Succeeded") {
                  const result = await job.destroy();
                }
                lastPhase = resource.status.phase;                
              }
              break;    
            case "DELETED":
              await bot.say(`Pod ${resource.metadata.name} deleted`);
              watch.stop();
              break;
          }
        },
        {type: "pods"}, 
        "default", 
        {
          qs: {
            labelSelector: `job-name=${job.resource.metadata.name}`,
          }
        }
      );  
      await watch.start();
    } catch(error) {
      console.error(`Error watching pods: ${error}`);
    }
    
    let jobResponse;
    try {
      jobResponse = await job.start();
    } catch(error) {
      console.error(`Error starting job: ${error}`);
      console.debug(job.resource);
    }
    await bot.say(`Started job ${jobResponse.metadata.name}`);
  });
}