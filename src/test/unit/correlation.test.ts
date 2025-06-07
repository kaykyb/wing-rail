import * as assert from "assert";
import {
  CorrelationTable,
  findViewColumnById,
  getIdByViewColumn,
  rebuildCorrelationTableFromIdsToGroupHash,
  rebuildCorrelationTableFromViewColumnsToId,
  rehashCorrelationTable,
} from "../../correlation";
import { Tab, TabGroup } from "vscode";

const correlationTable1: CorrelationTable = {
  viewColumnsToId: {
    1: "id1",
    2: "id2",
  },
  idsToGroupHash: {
    id1: "abc",
    id3: "ghi",
  },
};

const correlationTable1Persisted = {
  "1": "id1",
  "2": "id2",
};

const correlationTable1Clean: CorrelationTable = {
  viewColumnsToId: {
    1: "id1",
  },
  idsToGroupHash: {
    id1: "abc",
  },
};

const correlationTable1CleanPersisted = {
  "1": "id1",
};

const correlationTable2: CorrelationTable = {
  viewColumnsToId: {
    1: "id1",
    2: "id2",
    3: "id3",
  },
  idsToGroupHash: {
    id1: "abc",
    id2: "def",
    id4: "ghi",
  },
};

const correlationTable2Rehashed: CorrelationTable = {
  viewColumnsToId: {
    1: "id1",
    2: "id2",
    3: "id3",
  },
  idsToGroupHash: {
    id1: "123",
    id2: "456",
  },
};

const correlationTable2Rebuilt: CorrelationTable = {
  viewColumnsToId: {
    1: "id1",
    2: "id2",
  },
  idsToGroupHash: {
    id1: "abc",
    id2: "def",
  },
};

const correlationTable3Persisted = {
  1: "id1",
  2: "id2",
};

const correlationTable3Restored: CorrelationTable = {
  viewColumnsToId: {
    1: "id1",
    2: "id2",
  },
  idsToGroupHash: {
    id1: "ghi",
    id2: "abc",
  },
};

const correlationTable4: CorrelationTable = {
  viewColumnsToId: {
    1: "id1",
    2: "id2",
    3: "id3",
  },
  idsToGroupHash: {
    id1: "abc",
    id2: "def",
    id3: "ghi",
  },
};

const correlationTable4Rebuilt: CorrelationTable = {
  viewColumnsToId: {
    1: "id1",
    2: "id3",
  },
  idsToGroupHash: {
    id1: "abc",
    id3: "ghi",
  },
};

const tabGroupFixture = (viewColumn: number, tabLabels: string[]): TabGroup => {
  const gp: TabGroup = {
    isActive: false,
    viewColumn,
    activeTab: undefined,
    tabs: [],
  };

  const tabs = tabLabels.map<Tab>((label) => ({
    label,
    group: gp,
    input: {},
    isActive: false,
    isDirty: false,
    isPinned: false,
    isPreview: false,
  }));

  return { ...gp, tabs };
};

suite("getIdByViewColumn tests", () => {
  test("Can get id of group by view column", () => {
    assert.strictEqual(getIdByViewColumn(correlationTable1, 1), "id1");
    assert.strictEqual(getIdByViewColumn(correlationTable1, 2), "id2");
  });

  test("Can't get id of not existing view column", () => {
    assert.strictEqual(getIdByViewColumn(correlationTable1, 5), undefined);
  });
});

suite("findViewColumnById tests", () => {
  test("Can get view column by id of group", () => {
    assert.strictEqual(findViewColumnById(correlationTable1, "id1"), 1);
    assert.strictEqual(findViewColumnById(correlationTable1, "id2"), 2);
  });

  test("Can't get view column of not existing group id", () => {
    assert.strictEqual(findViewColumnById(correlationTable1, "id3"), undefined);
  });
});

suite("rebuildCorrelationTableFromIdsToGroupHash tests", () => {
  test("Drops non existing correlations", () => {
    const tabGroups = [tabGroupFixture(1, ["abc"]), tabGroupFixture(2, ["def"])];
    assert.deepStrictEqual(
      rebuildCorrelationTableFromIdsToGroupHash(correlationTable2.idsToGroupHash, tabGroups),
      correlationTable2Rebuilt
    );
  });

  test("Creates new correlations", () => {
    const tabGroups = [tabGroupFixture(1, ["abc"]), tabGroupFixture(2, ["def"]), tabGroupFixture(7, ["xyz"])];
    const newCorrelationTable = rebuildCorrelationTableFromIdsToGroupHash(correlationTable2.idsToGroupHash, tabGroups);
    const newGroupId = newCorrelationTable.viewColumnsToId[7];
    assert.strictEqual(newCorrelationTable.idsToGroupHash[newGroupId], "xyz");
  });

  test("Recorrelate viewColumnId to Group ID based on hash", () => {
    const tabGroups = [tabGroupFixture(1, ["abc"]), tabGroupFixture(2, ["ghi"])];
    const newCorrelationTable = rebuildCorrelationTableFromIdsToGroupHash(correlationTable4.idsToGroupHash, tabGroups);
    assert.deepStrictEqual(newCorrelationTable, correlationTable4Rebuilt);
  });
});

suite("rehashCorrelationTable tests", () => {
  test("Drops non existing groups only on hashes, does not affect View Columns to IDs", () => {
    const tabGroups = [tabGroupFixture(1, ["123"]), tabGroupFixture(2, ["456"])];
    assert.deepStrictEqual(
      rehashCorrelationTable(correlationTable2.viewColumnsToId, tabGroups),
      correlationTable2Rehashed
    );
  });
});

suite("rebuildCorrelationTableFromViewColumnsToId tests", () => {
  test("Restores correlation table from viewColumnsToId", () => {
    const tabGroups = [tabGroupFixture(1, ["abc"])];
    const newCorrelationTable = rebuildCorrelationTableFromViewColumnsToId(correlationTable1CleanPersisted, tabGroups);

    assert.deepStrictEqual(newCorrelationTable, correlationTable1Clean);
  });

  test("Restores correlation table viewColumnsToId drops non existing groups", () => {
    const tabGroups = [tabGroupFixture(1, ["abc"])];
    const newCorrelationTable = rebuildCorrelationTableFromViewColumnsToId(correlationTable1Persisted, tabGroups);

    assert.deepStrictEqual(newCorrelationTable, correlationTable1Clean);
  });

  test("Restores correlation table viewColumnsToId to workspace creates new groups", () => {
    const tabGroups = [tabGroupFixture(1, ["abc"]), tabGroupFixture(5, ["xyz"])];
    const newCorrelationTable = rebuildCorrelationTableFromViewColumnsToId(correlationTable1Persisted, tabGroups);

    const newGroupId = newCorrelationTable.viewColumnsToId[5];
    assert.strictEqual(newCorrelationTable.idsToGroupHash[newGroupId], "xyz");
  });

  test("Restores correlation table viewColumnsToId to workspace updates hashes and view columns", () => {
    const tabGroups = [tabGroupFixture(2, ["abc"]), tabGroupFixture(1, ["ghi"])];
    const newCorrelationTable = rebuildCorrelationTableFromViewColumnsToId(correlationTable3Persisted, tabGroups);

    assert.deepStrictEqual(newCorrelationTable, correlationTable3Restored);
  });
});
