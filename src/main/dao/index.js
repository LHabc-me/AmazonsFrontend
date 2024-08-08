import { Sequelize } from "sequelize";

let sequelize = null;
const createSequelize = (data_path) => {
  if (sequelize === null) {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: data_path + "amazons.sqlite",
      logging: console.log
    });
  }
  return sequelize;
};

export default createSequelize;
