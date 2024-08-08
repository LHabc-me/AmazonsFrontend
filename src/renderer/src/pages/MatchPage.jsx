import MatchPanel from "../components/MatchPanel";
import Board from "../components/Board";
import { useContext, useEffect, useRef, useState } from "react";
import { Chess, Game, initChessPositions, Stage } from "../judge";
import axios from "axios";
import { Button, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle } from "@fluentui/react-components";
import ToastContext from "../contexts/ToastContext";
import { translateCoordinate } from "../export";

function MatchPage(props) {
  const {
    className,
    style,
    matchLocation,
    matchName,
    firstPlayer,
    secondPlayer,
    isBlackFirst,
    boardSize,
    onMatchEnd
  } = props;

  const toast = useContext(ToastContext);

  const isMatchEnd = useRef(false);
  const gameRef = useRef(new Game({ boardSize, isBlackFirst }));
  const boardRef = useRef(null);
  const fromRef = useRef(null);
  const toRef = useRef(null);
  const arrowRef = useRef(null);
  const matchIdRef = useRef(null);
  const matchPanelConfigRef = useRef({
    matchLocation,
    matchStartTime: new Date(),
    firstPlayer,
    secondPlayer,
    isBlackFirst,
    firstPlayerTimeConsumed: 0, // 先手耗时xx秒
    secondPlayerTimeConsumed: 0,
    isBlackTurn: gameRef.current.isBlackTurn(),
    blockFirstPlayerAIControl: false,
    blockSecondPlayerAIControl: false,
    firstPlayerAIMode: false,
    secondPlayerAIMode: false,
    firstPlayerAIUrl: "http://127.0.0.1:5000/move",
    secondPlayerAIUrl: "http://127.0.0.1:5000/move",
    firstPlayerAITimeLimit: 5,
    secondPlayerAITimeLimit: 5,
    lastMove: null,
    replaceTerminateAsReturn: false,
    onFirstPlayerAITimeLimitChange: (time) => {
      setMatchPanelConfig(c => {
        return {
          ...c,
          firstPlayerAITimeLimit: time
        };
      });
    },
    onSecondPlayerAITimeLimitChange: (time) => {
      setMatchPanelConfig(c => {
        return {
          ...c,
          secondPlayerAITimeLimit: time
        };
      });
    },
    onFirstPlayerAIModeChange: (aiMode) => {
      setMatchPanelConfig(c => {
        return {
          ...c,
          firstPlayerAIMode: aiMode
        };
      });
    },
    onSecondPlayerAIModeChange: (aiMode) => {
      setMatchPanelConfig(c => {
        return {
          ...c,
          secondPlayerAIMode: aiMode
        };
      });
    },
    onFirstPlayerAIUrlChange: (url) => {
      setMatchPanelConfig(c => {
        return {
          ...c,
          firstPlayerAIUrl: url
        };
      });
    },
    onSecondPlayerAIUrlChange: (url) => {
      setMatchPanelConfig(c => {
        return {
          ...matchPanelConfig,
          secondPlayerAIUrl: url
        };
      });
    },
    onFirstPlayerResign: () => {
      endMatch(secondPlayer);
    },
    onSecondPlayerResign: () => {
      endMatch(firstPlayer);
    },
    onUndo: () => {
      setShowConfirmUndoDialog(true);
    },
    onTerminate: () => {
      setShowConfirmTerminateDialog(true);
    },
    onRestart: () => {
    },
    onViewLog: () => {
    },
    onReturn: () => {
      onMatchEnd();
    }
  });
  const timerRef = useRef(null);

  const [matchPanelConfig, setMatchPanelConfig] = useState(matchPanelConfigRef.current);

  const [boardConfig, setBoardConfig] = useState({
    boardSize,
    initBlackChessPositions: initChessPositions(boardSize)[0],
    initWhiteChessPositions: initChessPositions(boardSize)[1],
    onClickGrid: (x, y) => {
      if ((gameRef.current.isFirstPlayerTurn() && matchPanelConfigRef.current.firstPlayerAIMode) ||
        (gameRef.current.isSecondPlayerTurn() && matchPanelConfigRef.current.secondPlayerAIMode)) {
        return;
      }
      handlePlayerMove(x, y);
    }
  });

  const [showWinnerDialog, setShowWinnerDialog] = useState(false);
  const [winner, setWinner] = useState(null);
  const [showConfirmUndoDialog, setShowConfirmUndoDialog] = useState(false);
  const [showConfirmTerminateDialog, setShowConfirmTerminateDialog] = useState(false);

  const getAIMove = async (api, { history, board_size, time_limit }) => {
    try {
      const response = await axios.post(api, { history, board_size, time_limit }); // response.data = [fromX, fromY, toX, toY, arrowX, arrowY]
      const from = [response.data[0], response.data[1]];
      const to = [response.data[2], response.data[3]];
      const arrow = [response.data[4], response.data[5]];
      return [from, to, arrow];
    } catch (e) {
      toast.error("AI请求失败", e.message);
      let key = "firstPlayerAIMode";
      if (gameRef.current.isSecondPlayerTurn()) {
        key = "secondPlayerAIMode";
      }
      setMatchPanelConfig(c => {
        return {
          ...c,
          blockFirstPlayerAIControl: false,
          blockSecondPlayerAIControl: false,
          [key]: false
        };
      });
      // const winner = gameRef.current.isFirstPlayerTurn() ? secondPlayer : firstPlayer;
      // await endMatch(winner);
    }
  };

  function handlePlayerMove(x, y) {
    /*
        比如是黑棋回合，若处于选子阶段，则点击场上的黑棋则更新fromRef为点击的位置
                                     若fromRef不为空，则点击场上的可到达位置则走棋并更新toRef为点击的位置
                                     否则不做任何操作
                      若处于放障碍阶段，若toRef不为空，则点击场上的可到达位置则放障碍并更新arrowRef为点击的位置
                                     然后进入下一回合，清空fromRef、toRef和arrowRef
                                     否则不做任何操作
                      是否可以走棋或放障碍由judge模块的Game类的getLegalMoves方法判断
        白棋回合同理
     */
    try {
      if (isMatchEnd.current) {
        return;
      }
      const chess = gameRef.current.board[x][y];
      if (gameRef.current.stage === Stage.CHESS) {
        if (
          (gameRef.current.isBlackTurn() && chess === Chess.BLACK) ||
          (gameRef.current.isWhiteTurn() && chess === Chess.WHITE)
        ) {
          if (gameRef.current.stage === Stage.CHESS) {
            fromRef.current = [x, y];
            if (!(gameRef.current.isFirstPlayerTurn() && matchPanelConfigRef.current.firstPlayerAIMode) &&
              !(gameRef.current.isSecondPlayerTurn() && matchPanelConfigRef.current.secondPlayerAIMode)) {
              boardRef.current.showChessHint(gameRef.current.getLegalMoves(fromRef.current)); // 显示可到达位置的提示
            }
          }
        } else if (fromRef.current !== null) {
          const moves = gameRef.current.getLegalMoves(fromRef.current);
          if (moves.some(move => move[0] === x && move[1] === y)) {
            toRef.current = [x, y];
            gameRef.current.play(fromRef.current, toRef.current); // 走棋
            boardRef.current.movePiece(fromRef.current, toRef.current); // 更新棋盘
            boardRef.current.showChessHint([]); // 清空可到达位置的提示
            if (!(gameRef.current.isFirstPlayerTurn() && matchPanelConfigRef.current.firstPlayerAIMode) &&
              !(gameRef.current.isSecondPlayerTurn() && matchPanelConfigRef.current.secondPlayerAIMode)) {
              boardRef.current.showArrowHint(gameRef.current.getLegalMoves(toRef.current)); // 显示可放障碍的提示
            }
          }
        }
      } else if (gameRef.current.stage === Stage.ARROW) {
        if (toRef.current !== null) {
          const moves = gameRef.current.getLegalMoves(toRef.current);
          if (moves.some(move => move[0] === x && move[1] === y)) {
            stopTimer();
            arrowRef.current = [x, y];
            gameRef.current.play(toRef.current, arrowRef.current); // 放障碍
            boardRef.current.placeArrow(arrowRef.current); // 更新棋盘
            boardRef.current.showArrowHint([]); // 清空可放障碍的提示
            const [from_x, from_y] = fromRef.current;
            const [to_x, to_y] = toRef.current;
            const [arrow_x, arrow_y] = arrowRef.current;
            window.api.createMatchDetail({
              match_id: matchIdRef.current,
              round: gameRef.current.round,
              from_x,
              from_y,
              to_x,
              to_y,
              arrow_x,
              arrow_y
            }); // 记录对局
            const board_size = parseInt(boardSize);
            setMatchPanelConfig(c => {
              return {
                ...c,
                isBlackTurn: gameRef.current.isBlackTurn(),
                lastMove: `${translateCoordinate(from_x, from_y, board_size)}${translateCoordinate(to_x, to_y, board_size)}(${translateCoordinate(arrow_x, arrow_y, board_size)})`.toUpperCase()
              };
            });
            requestFirstPlayerMove();
            requestSecondPlayerMove();
            fromRef.current = null;
            toRef.current = null;
            arrowRef.current = null;
          }
        }
      }
    } catch (e) {
      toast.error(e.message);
      endMatch(secondPlayer);
    }
  }

  async function requestAIMove() {
    let key = null;
    if (gameRef.current.isFirstPlayerTurn()) {
      key = "blockFirstPlayerAIControl";
    } else {
      key = "blockSecondPlayerAIControl";
    }
    setMatchPanelConfig(c => {
      return {
        ...c,
        [key]: true
      };
    });
    let api = null;
    let time_limit = null;
    let board_size = parseInt(boardSize);
    let history = gameRef.current.getHistoryAsArray();
    if (gameRef.current.isFirstPlayerTurn() && matchPanelConfigRef.current.firstPlayerAIMode) {
      api = matchPanelConfigRef.current.firstPlayerAIUrl;
      time_limit = matchPanelConfigRef.current.firstPlayerAITimeLimit;
    } else if (gameRef.current.isSecondPlayerTurn() && matchPanelConfigRef.current.secondPlayerAIMode) {
      api = matchPanelConfigRef.current.secondPlayerAIUrl;
      time_limit = matchPanelConfigRef.current.secondPlayerAITimeLimit;
    }
    time_limit = parseFloat(time_limit);
    const [from, to, arrow] = await getAIMove(api, { history, board_size, time_limit });
    handlePlayerMove(from[0], from[1]);
    handlePlayerMove(to[0], to[1]);
    setTimeout(() => {
      handlePlayerMove(arrow[0], arrow[1]);
    }, 500);
    setMatchPanelConfig(c => {
      return {
        ...c,
        [key]: false
      };
    });
  }

  async function endMatch(winner) {
    if (isMatchEnd.current) {
      return;
    }
    stopTimer();
    isMatchEnd.current = true;
    setMatchPanelConfig(c => {
      return {
        ...c,
        replaceTerminateAsReturn: true
      };
    });
    setShowConfirmTerminateDialog(false);
    await window.api.setWinner({ match_id: matchIdRef.current, winner });
    toast.success("对局已保存");
    setWinner(winner);
    if (winner !== null) {
      setShowWinnerDialog(true);
    } else {
      onMatchEnd();
    }
  }

  async function requestFirstPlayerMove() {
    if (isMatchEnd.current) {
      return;
    }
    if (gameRef.current.isFirstPlayerTurn()) {
      if (!gameRef.current.canMove()) {
        await endMatch(secondPlayer);
        return;
      }
      startTimer("firstPlayer");
      if (matchPanelConfigRef.current.firstPlayerAIMode) {
        await requestAIMove();
      }
    }
  }

  async function requestSecondPlayerMove() {
    if (isMatchEnd.current) {
      return;
    }
    if (gameRef.current.isSecondPlayerTurn()) {
      if (!gameRef.current.canMove()) {
        await endMatch(firstPlayer);
        return;
      }
      startTimer("secondPlayer");
      if (matchPanelConfigRef.current.secondPlayerAIMode) {
        await requestAIMove();
      }
    }
  }

  function undo() {
    setShowConfirmUndoDialog(false);
    if (winner !== null) {
      toast.error("悔棋失败", "对局已结束");
      return;
    }
    if (gameRef.current.stage === Stage.ARROW) {
      toast.error("悔棋失败", "当前阶段无法悔棋");
      return;
    }
    const history = gameRef.current.getHistoryAsArray();
    const round = gameRef.current.round;
    if (history.length === 0) {
      toast.error("悔棋失败", "当前对局无棋可悔");
      return;
    }
    boardRef.current.showArrowHint([]);
    boardRef.current.showChessHint([]);
    fromRef.current = null;
    toRef.current = null;
    arrowRef.current = null;
    const [fromX, fromY, toX, toY, arrowX, arrowY] = history[history.length - 1];
    for (let i = 0; i < 2; i++) {
      gameRef.current.undo();
    }
    window.api.removeMatchDetail({ match_id: matchIdRef.current, round });
    boardRef.current.withDrawArrow([arrowX, arrowY]);
    let lastMove = null;
    if (history.length >= 2) {
      const [fromX, fromY, toX, toY, arrowX, arrowY] = history[history.length - 2];
      lastMove = `${translateCoordinate(fromX, fromY, boardSize)}${translateCoordinate(toX, toY, boardSize)}(${translateCoordinate(arrowX, arrowY, boardSize)})`.toUpperCase();
    }
    setTimeout(() => {
      boardRef.current.movePiece([toX, toY], [fromX, fromY]);
      setMatchPanelConfig(c => {
        return {
          ...c,
          isBlackTurn: gameRef.current.isBlackTurn(),
          lastMove
        };
      });
    }, 500);
  }

  function terminate() {
    if (winner !== null) {
      // toast.error("强行终止失败", "对局已结束");
      onMatchEnd();
      return;
    }
    endMatch(null);
  }

  function startTimer(side) {
    if (timerRef.current !== null) {
      // toast.error("计时器启动失败", "计时器已启动");
      return;
    }
    timerRef.current = setInterval(() => {
      setMatchPanelConfig(c => {
        return {
          ...c,
          [`${side}TimeConsumed`]: c[`${side}TimeConsumed`] + 1
        };
      });
    }, 1000);
  }

  function stopTimer() {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
    }
    timerRef.current = null;
  }

  useEffect(() => {
    window.api
      .createMatchInfo({
        time: matchPanelConfigRef.current.matchStartTime,
        location: matchLocation,
        name: matchName,
        board_size: boardSize,
        first_team: firstPlayer,
        second_team: secondPlayer,
        winner: null
      })
      .then((matchInfo) => {
        matchIdRef.current = matchInfo.dataValues.id;
      });
  }, []);

  useEffect(() => {
    matchPanelConfigRef.current = matchPanelConfig;
    requestFirstPlayerMove();
  }, [matchPanelConfig.firstPlayerAIMode]);

  useEffect(() => {
    matchPanelConfigRef.current = matchPanelConfig;
    requestSecondPlayerMove();
  }, [matchPanelConfig.secondPlayerAIMode]);

  useEffect(() => {
    matchPanelConfigRef.current = matchPanelConfig;
  }, [matchPanelConfig]);

  return (
    <div className={className} style={style}>
      <div className="flex flex-row justify-center w-full h-full">
        <MatchPanel className="w-64 h-full shadow-lg"
                    {...matchPanelConfig} />
        <Board className="flex-1 h-full"
               ref={boardRef}
               {...boardConfig} />
      </div>
      {
        <Dialog open={showWinnerDialog}
                modalType="non-modal"
                onOpenChange={(event, data) => setShowWinnerDialog(data.open)}>
          <DialogSurface className="w-80">
            <DialogBody>
              <DialogTitle>
                胜者：<span className="text-blue-500 font-bold">{winner}</span>
              </DialogTitle>
              <DialogContent>
                点击回到主页
              </DialogContent>
              <DialogActions>
                <Button appearance="primary" onClick={onMatchEnd}>返回</Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      }
      {
        <Dialog open={showConfirmUndoDialog}
                onOpenChange={(event, data) => setShowConfirmUndoDialog(data.open)}>
          <DialogSurface className="w-80">
            <DialogBody>
              <DialogTitle>
                确定要悔棋吗？
              </DialogTitle>
              <DialogActions>
                <Button onClick={undo}>确定</Button>
                <Button appearance="primary"
                        onClick={() => setShowConfirmUndoDialog(false)}>
                  取消
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      }
      {
        <Dialog open={showConfirmTerminateDialog}
                onOpenChange={(event, data) => setShowConfirmTerminateDialog(data.open)}>
          <DialogSurface className="w-80">
            <DialogBody>
              <DialogTitle>
                确定要强行终止吗？
              </DialogTitle>
              <DialogActions>
                <Button onClick={terminate}>确定</Button>
                <Button appearance="primary"
                        onClick={() => setShowConfirmTerminateDialog(false)}>
                  取消
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      }
    </div>
  );
}

export default MatchPage;

