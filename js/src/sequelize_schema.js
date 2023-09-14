const Sequelize = require("sequelize");
const DataTypes = require("sequelize/lib/data-types");

const loadModels = (dialect, ...models) => {
  let sequelize = new Sequelize({
    dialect: dialect,
  });
  const db = {};
  for (const model of models) {
    const m = model(sequelize, DataTypes);
    if (m?.name) {
      db[m.name] = m;
    }
  }
  // create associations between models
  for (const modelName of Object.keys(db)) {
    if (db[modelName]?.associate) {
      db[modelName].associate(db);
    }
  }
  const modelsOrdered = sequelize.modelManager
    .getModelsTopoSortedByForeignKey()
    .reverse();
  let sql = "";
  for (const model of modelsOrdered) {
    const def = sequelize.modelManager.getModel(model.name);
    const attr = sequelize
      .getQueryInterface()
      .queryGenerator.attributesToSQL(def.getAttributes(), { ...def.options });
    sql +=
      sequelize
        .getQueryInterface()
        .queryGenerator.createTableQuery(def.tableName, attr, {
          ...def.options,
        }) + "\n";
  }
  return sql;
};

module.exports = loadModels;
