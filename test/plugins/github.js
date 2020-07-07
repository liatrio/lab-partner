const sinon = require("sinon");
const expect = require("chai").expect;
const chance = require("chance").Chance();

const MockController = require("../mocks/controller");

const github = require("../../plugins/github");

describe("plugins / github", () => {
    let controller;
    let octokitStub;
    let clock;

    describe("Setup", () => {
        describe("getOctokit", () => {
            it("should return Octokit with auth if undefined", () => {
                process.env.GITHUB_TOKEN = chance.word();
                github.getOctokit();
                delete process.env.GITHUB_TOKEN;
            });
        });
    });

    describe("Methods", () => {
        before(() => {
            clock = sinon.useFakeTimers();
        });

        after(() => {
            clock.restore();
        });

        beforeEach(() => {
            controller = new MockController({});
            octokitStub = {
                repos: {
                    listCommits: sinon.stub(),
                    listForUser: sinon.stub(),
                },
                users: {
                    getByUsername: sinon.stub(),
                },
            };
            github.getOctokit = sinon.stub().returns(octokitStub);
        });

        describe("init", () => {
            it("should add plugin extensions", () => {
                github.init(controller);
                sinon.assert.calledOnce(controller.addPluginExtension);
                sinon.assert.calledWith(
                    controller.addPluginExtension,
                    "github",
                    github
                );
            });
        });

        describe("getGithubUser", () => {
            const username = chance.word();
            const response = {
                data: { id: chance.word() },
            };
            it("Should make a call to Github with username", async () => {
                octokitStub.users.getByUsername.resolves(response);
                const user = await github.getGithubUser(username);
                sinon.assert.calledWith(octokitStub.users.getByUsername, {
                    username,
                });
                expect(user).to.be.equal(response);
            });
        });

        describe("getUserRepositories", () => {
            const username = chance.word();
            const repo1 = { id: chance.word() };
            const repo2 = { id: chance.word() };
            const response = {
                data: [repo1, repo2],
            };
            it("should list a user's repositories", async () => {
                octokitStub.repos.listForUser.resolves(response);
                const repoList = await github.getUserRepositories(username);
                sinon.assert.calledWith(octokitStub.repos.listForUser, {
                    username,
                });
                expect(repoList).to.be.equal(response.data);
            });
        });

        describe("getRepoCommits", () => {
            const owner = chance.word();
            const repo = chance.word();
            const response = {
                data: {
                    author: {
                        id: chance.word(),
                    },
                },
            };
            it("should return a list of a user's past commits", async () => {
                octokitStub.repos.listCommits.resolves(response);
                const commits = await github.getRepoCommits(owner, repo);
                sinon.assert.calledWith(octokitStub.repos.listCommits, {
                    owner,
                    repo,
                });
                expect(commits).to.be.equal(response.data);
            });
        });

        describe("watchForNewRepo", () => {
            const username = chance.word();
            const repo1 = { id: chance.word() };
            const repo2 = { id: chance.word() };
            const repo3 = { id: chance.word() };
            const repoList = {
                data: [repo1, repo2, repo3],
            };
            const callback = sinon.spy();
            it("should trigger the watch interval and trigger the callback for each new repo", async () => {
                octokitStub.repos.listForUser
                    .onFirstCall()
                    .resolves({ data: [repo3] });
                octokitStub.repos.listForUser.onSecondCall().resolves(repoList);
                const stop = await github.watchForNewRepo(username, callback);
                await clock.nextAsync();
                stop();
                sinon.assert.calledTwice(octokitStub.repos.listForUser);
                sinon.assert.calledTwice(callback);
                sinon.assert.calledWith(callback, repo1);
                sinon.assert.calledWith(callback, repo2);
            });
        });

        describe("watchForNewCommits", () => {
            const username = chance.word();
            const repo = chance.word();
            const commitList = {
                data: [
                    { sha: chance.word() },
                    { sha: chance.word() },
                    { sha: chance.word() },
                ],
            };
            const callback = sinon.spy();
            it("should trigger the interval to watch for all new commits for a given repo", async () => {
                octokitStub.repos.listCommits
                    .onFirstCall()
                    .resolves({ data: [commitList.data[2]] });
                octokitStub.repos.listCommits
                    .onSecondCall()
                    .resolves(commitList);
                const stop = await github.watchForNewCommits(
                    username,
                    repo,
                    callback
                );
                await clock.nextAsync();
                stop();
                sinon.assert.calledTwice(octokitStub.repos.listCommits);
                sinon.assert.calledOnce(callback);
            });
            it("should do nothing for no new commits", async () => {
                octokitStub.repos.listCommits
                    .onFirstCall()
                    .resolves({ data: [commitList.data[2]] });
                octokitStub.repos.listCommits
                    .onSecondCall()
                    .resolves({ data: [commitList.data[2]] });
                const stop = await github.watchForNewCommits(
                    username,
                    repo,
                    callback
                );
                await clock.nextAsync();
                stop();
                sinon.assert.calledTwice(octokitStub.repos.listCommits);
            });
        });
    });
});
