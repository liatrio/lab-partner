const sinon = require("sinon");
const should = require("chai").should(); // eslint-disable-line no-unused-vars

const MockController = require("../mocks/controller");

const github = require("../../plugins/github");

describe("plugins / github", () => {
    let controller;

    beforeEach(() => {
        controller = new MockController({});
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
        let username = "liatrio";
        it("should not cause an error", () => {
            github.getGithubUser(username);
        });
    });

    describe("getUserRepositories", () => {
        let username = "liatrio";
        it("should not cause an error", () => {
            github.getUserRepositories(username);
        });
    });

    describe("getRepoCommits", () => {
        let username = "liatrio";
        let repo = "springtrader-marketsummary";
        it("should not cause an error", () => {
            github.getRepoCommits(username, repo);
        });
    });

    describe("watchForNewRepo", () => {
        let username = "liatrio";
        it("should not cause an error", () => {
            github.watchForNewRepo(
                username,
                (repo) => {
                    return repo;
                },
                true
            );
        });
    });

    describe("watchForNewCommits", () => {
        let username = "liatrio";
        let repo = "springtrader-marketsummary";
        it("should not cause an error", () => {
            github.watchForNewCommits(
                username,
                repo,
                (repo) => {
                    return repo;
                },
                true
            );
        });
    });
});
