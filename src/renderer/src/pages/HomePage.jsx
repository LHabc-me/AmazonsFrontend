import { Button, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, DialogTrigger, Input, Label, Select } from "@fluentui/react-components";
import { useEffect, useState } from "react";

const HomePage = (props) => {
  const {
    className,
    style,
    onNewMatch,
    onShowHistory
  } = props;
  const [matchConfig, setMatchConfig] = useState({
    matchLocation: "线上",
    matchName: "国赛",
    firstPlayer: "吉软亚马逊",
    secondPlayer: "AI",
    isBlackFirst: false,
    boardSize: 10
  });

  useEffect(() => {
    window.electron.ipcRenderer
      .invoke("get-data-path")
      .then((dataPath) => {
        window.api.initMatchModels(dataPath);
      });
  }, []);

  return (
    <div className={className} style={style}>
      <div className="flex flex-col items-center justify-center w-full h-full p-5">
        <div className="text-2xl font-bold mb-5">亚马逊棋对战平台</div>
        <div className="flex flex-row gap-4">
          <Button size="large" onClick={onShowHistory}>历史对局</Button>
          <Dialog>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="primary"
                      size="large">
                新对局
              </Button>
            </DialogTrigger>
            <DialogSurface className="w-80">
              <DialogBody>
                <DialogTitle>开始新对局</DialogTitle>
                <DialogContent>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col">
                      <Label>
                        比赛地点
                      </Label>
                      <Input value={matchConfig.matchLocation}
                             onChange={(_, data) => {
                               setMatchConfig(c => {
                                 return {
                                   ...c,
                                   matchLocation: data.value
                                 };
                               });
                             }} />
                    </div>
                    <div className="flex flex-col">
                      <Label>
                        赛事名称
                      </Label>
                      <Input value={matchConfig.matchName}
                             onChange={(_, data) => {
                               setMatchConfig(c => {
                                 return {
                                   ...c,
                                   matchName: data.value
                                 };
                               });
                             }} />
                    </div>
                    <div className="flex flex-col">
                      <Label>
                        先手队伍
                      </Label>
                      <Input value={matchConfig.firstPlayer}
                             onChange={(_, data) => {
                               setMatchConfig(c => {
                                 return {
                                   ...c,
                                   firstPlayer: data.value
                                 };
                               });
                             }} />
                    </div>
                    <div className="flex flex-col">
                      <Label>
                        后手队伍
                      </Label>
                      <Input value={matchConfig.secondPlayer}
                             onChange={(_, data) => {
                               setMatchConfig(c => {
                                 return {
                                   ...c,
                                   secondPlayer: data.value
                                 };
                               });
                             }} />
                    </div>
                    <div>
                      <Label>
                        下棋顺序
                      </Label>
                      <Select value={matchConfig.isBlackFirst ? "黑棋（棋盘上方）先手" : "白棋（棋盘下方）先手"}
                              onChange={(_, data) => {
                                setMatchConfig(c => {
                                  return {
                                    ...c,
                                    isBlackFirst: data.value === "黑棋（棋盘上方）先手"
                                  };
                                });
                              }}>
                        <option>白棋（棋盘下方）先手</option>
                        <option>黑棋（棋盘上方）先手</option>
                      </Select>
                    </div>
                    <div>
                      <Label>
                        棋盘大小
                      </Label>
                      <Select value={`${matchConfig.boardSize}x${matchConfig.boardSize}`}
                              onChange={(_, data) => {
                                setMatchConfig(c => {
                                  return {
                                    ...c,
                                    boardSize: parseInt(data.value.split("x")[0])
                                  };
                                });
                              }}>
                        <option>10x10</option>
                        <option>8x8</option>
                      </Select>
                    </div>
                  </div>
                </DialogContent>
                <DialogActions>
                  <DialogTrigger disableButtonEnhancement>
                    <Button appearance="secondary">取消</Button>
                  </DialogTrigger>
                  <Button appearance="primary"
                          onClick={() => onNewMatch(matchConfig)}>
                    确定
                  </Button>
                </DialogActions>
              </DialogBody>
            </DialogSurface>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
