import * as assert from "assert";
import {
  addRegexpAssigns,
  belongsToRegexpAssignsGroup,
  removeRegexpAssigns,
  removeRegexpAssignsGroup,
} from "../../assigns";

const regexpAssigns1 = {
  "^(.+)\\.js$": "g1",
  "^(.+)\\.ex$": "g2",
  "^(.+)\\.html$": "g2",
};

suite("removeRegexpAssigns tests", () => {
  test("Deletes existing regexp assign", () => {
    const regexpAssigns = {
      "^(.+)\\.js$": "g1",
      "^(.+)\\.ex$": "g2",
      "^(.+)\\.html$": "g2",
    };

    const regexpAssignsExpected = {
      "^(.+)\\.js$": "g1",
      "^(.+)\\.html$": "g2",
    };

    const res = removeRegexpAssigns(regexpAssigns, "^(.+)\\.ex$");
    assert.deepStrictEqual(res, regexpAssignsExpected);
  });

  test("Deletes non existing regexp assign", () => {
    const regexpAssigns = {
      "^(.+)\\.js$": "g1",
      "^(.+)\\.ex$": "g2",
      "^(.+)\\.html$": "g2",
    };

    const res = removeRegexpAssigns(regexpAssigns, "^(.+)\\.ab$");
    assert.deepStrictEqual(res, regexpAssigns1);
  });
});

suite("addRegexpAssigns tests", () => {
  test("Deletes existing regexp assign", () => {
    const regexpAssigns = {
      "^(.+)\\.js$": "g1",
      "^(.+)\\.ex$": "g2",
      "^(.+)\\.html$": "g2",
    };

    const regexpAssignsAdded = {
      "^(.+)\\.js$": "g1",
      "^(.+)\\.ex$": "g2",
      "^(.+)\\.html$": "g2",
      "^(.+)\\.ab$": "g3",
    };

    const res = addRegexpAssigns(regexpAssigns, "^(.+)\\.ab$", "g3");
    assert.deepStrictEqual(res, regexpAssignsAdded);
  });
});

suite("removeRegexpAssignsGroup tests", () => {
  test("Deletes existing regexp assigns for a specific group", () => {
    const regexpAssigns = {
      "^(.+)\\.js$": "g1",
      "^(.+)\\.ex$": "g2",
      "^(.+)\\.html$": "g2",
    };

    const regexpAssignsRemoved = {
      "^(.+)\\.js$": "g1",
    };

    const res = removeRegexpAssignsGroup(regexpAssigns, "g2");
    assert.deepStrictEqual(res, regexpAssignsRemoved);
  });
});

suite("belongsToRegexpAssignsGroup tests", () => {
  test("Matches file path to correct group", () => {
    const group = belongsToRegexpAssignsGroup(regexpAssigns1, "abciojiead.ex");
    assert.strictEqual(group, "g2");
  });

  test("Matches file path to no group", () => {
    const group = belongsToRegexpAssignsGroup(regexpAssigns1, "abciojiead.toml");
    assert.strictEqual(group, undefined);
  });
});
