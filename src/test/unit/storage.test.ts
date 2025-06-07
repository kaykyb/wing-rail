import * as assert from "assert";
import {
  retrieveRegexpAssigns,
  saveRegexpAssigns,
  saveViewColumnsToIdTable,
  retrieveViewColumnsToIdTable,
} from "../../storage";

const regexpAssigns1 = {
  "^(.+)\\.js$": "g1",
  "^(.+)\\.ex$": "g2",
  "^(.+)\\.html$": "g2",
};

const viewColumnsToId1 = {
  1: "id1",
  2: "id2",
};

const viewColumnsToId1Persisted = {
  "1": "id1",
  "2": "id2",
};

suite("restoreRegexpAssigns tests", () => {
  test("Restores from context", () => {
    let args = { key: undefined };
    let calls = 0;

    const ctx = {
      workspaceState: {
        get: (key: any) => {
          args.key = key;
          calls++;
          return regexpAssigns1;
        },
      },
    };

    const restored = retrieveRegexpAssigns(ctx as any);

    assert.strictEqual(args.key, "wing-rail.regexpAssigns");
    assert.strictEqual(calls, 1);
    assert.deepStrictEqual(restored, regexpAssigns1);
  });
});

suite("saveRegexpAssigns tests", () => {
  test("Saves to workspace state", () => {
    let args = { key: undefined, value: undefined };
    let calls = 0;

    saveRegexpAssigns(
      {
        workspaceState: {
          update: (key: any, value: any) => {
            calls++;
            args = { key, value };
          },
        },
      } as any,
      regexpAssigns1
    );

    assert.equal(calls, 1);
    assert.equal(args.key, "wing-rail.regexpAssigns");
    assert.deepStrictEqual(args.value, regexpAssigns1);
  });
});

suite("saveViewColumnToIds tests", () => {
  test("Saves correlation table viewColumnsToId to workspace", () => {
    let args = { key: undefined, value: undefined };
    let calls = 0;

    saveViewColumnsToIdTable(
      {
        workspaceState: {
          update: (key: any, value: any) => {
            calls++;
            args = { key, value };
          },
        },
      } as any,
      viewColumnsToId1
    );

    assert.equal(calls, 1);
    assert.equal(args.key, "wing-rail.correlationTable.viewColumnsToId");
    assert.deepStrictEqual(args.value, viewColumnsToId1);
  });
});

suite("retrieveViewColumnsToIdTable tests", () => {
  test("Restores from context and convert strings to int", () => {
    let args = { key: undefined };
    let calls = 0;

    const ctx = {
      workspaceState: {
        get: (key: any) => {
          args.key = key;
          calls++;
          return viewColumnsToId1Persisted;
        },
      },
    };

    const restored = retrieveViewColumnsToIdTable(ctx as any);

    assert.strictEqual(args.key, "wing-rail.correlationTable.viewColumnsToId");
    assert.strictEqual(calls, 1);
    assert.deepStrictEqual(restored, viewColumnsToId1);
  });
});
