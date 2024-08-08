import { DataTypes } from "sequelize";
import createSequelize from "../dao";


let MatchInfo = null;
let MatchDetail = null;

async function initMatchModels(data_path) {
  const sequelize = createSequelize(data_path);

  // id，比赛时间，比赛地点，先手队伍，后手队伍，胜利队伍
  MatchInfo = sequelize.define(
    "match_info",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      time: {
        type: DataTypes.DATE,
        allowNull: true
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true
      },
      board_size: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      first_team: {
        type: DataTypes.STRING,
        allowNull: false
      },
      second_team: {
        type: DataTypes.STRING,
        allowNull: false
      },
      winner: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {
      tableName: "match_info",
      createdAt: false,
      updatedAt: false
    }
  );

  // id，比赛id，回合数，起始坐标，终点坐标，障碍坐标
  MatchDetail = sequelize.define(
    "match_detail",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      match_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: MatchInfo,
          key: "id"
        }
      },
      round: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      from_x: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      from_y: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      to_x: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      to_y: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      arrow_x: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      arrow_y: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      tableName: "match_detail",
      createdAt: false,
      updatedAt: false
    }
  );
  await Promise.all([
    MatchInfo.sync(),
    MatchDetail.sync()
  ]);
  return { MatchInfo, MatchDetail };
}

async function createMatchInfo({ time, location, name, board_size, first_team, second_team, winner }) {
  return await MatchInfo.create({
    time,
    location,
    name,
    board_size,
    first_team,
    second_team,
    winner
  });
}


async function removeMatchInfo(match_ids) {
  await MatchDetail.destroy({
    where: {
      match_id: match_ids
    }
  });
  return await MatchInfo.destroy({
    where: {
      id: match_ids
    }
  });
}

async function setWinner({ match_id, winner }) {
  return await MatchInfo.update(
    {
      winner
    },
    {
      where: {
        id: match_id
      }
    }
  );
}

async function createMatchDetail({ match_id, round, from_x, from_y, to_x, to_y, arrow_x, arrow_y }) {
  return await MatchDetail.create({
    match_id,
    round,
    from_x,
    from_y,
    to_x,
    to_y,
    arrow_x,
    arrow_y
  });
}

async function removeMatchDetail({ match_id, round }) {
  return await MatchDetail.destroy({
    where: {
      match_id,
      round
    }
  });

}


async function getAllMatchInfo() {
  const infos = await MatchInfo.findAll({
    order: [["time", "DESC"]]
  });
  return infos.map(info => info.toJSON());
}

async function getMatchDetail(match_id) { // 按
  const details = await MatchDetail.findAll({
    where: {
      match_id
    },
    order: [["round", "ASC"]]
  });
  return details.map(detail => detail.toJSON());
}


export {
  initMatchModels,
  createMatchInfo,
  removeMatchInfo,
  setWinner,
  createMatchDetail,
  removeMatchDetail,
  getAllMatchInfo,
  getMatchDetail
};
