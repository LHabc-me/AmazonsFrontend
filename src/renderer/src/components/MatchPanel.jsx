import { Button, Checkbox, Dialog, DialogActions, DialogBody, DialogSurface, DialogTitle, Input } from "@fluentui/react-components";
import { useRef, useState } from "react";

const MatchPanel = (props) => {
  const {
    className,
    style,
    matchLocation,
    matchStartTime,
    isBlackFirst,
    isBlackTurn,
    firstPlayer,
    secondPlayer,
    firstPlayerTimeConsumed,
    secondPlayerTimeConsumed,
    blockFirstPlayerAIControl,
    blockSecondPlayerAIControl,
    firstPlayerAIMode,
    secondPlayerAIMode,
    firstPlayerAIUrl,
    secondPlayerAIUrl,
    firstPlayerAITimeLimit,
    secondPlayerAITimeLimit,
    onFirstPlayerAITimeLimitChange,
    onSecondPlayerAITimeLimitChange,
    onFirstPlayerAIModeChange,
    onSecondPlayerAIModeChange,
    onFirstPlayerAIUrlChange,
    onSecondPlayerAIUrlChange,
    onFirstPlayerResign,
    onSecondPlayerResign,
    onUndo,
    onTerminate,
    onRestart,
    onViewLog,
    onReturn,
    lastMove,
    replaceTerminateAsReturn
  } = props;
  const resignFuncRef = useRef(null);
  const isFirstPlayerTurn = ((isBlackFirst && isBlackTurn) || (!isBlackFirst && !isBlackTurn));
  const [showResignDialog, setShowResignDialog] = useState(false);

  const firstPlayerTimeConsumedHours = Math.floor(firstPlayerTimeConsumed / 3600);
  const firstPlayerTimeConsumedMinutes = Math.floor((firstPlayerTimeConsumed % 3600) / 60);
  const firstPlayerTimeConsumedSeconds = firstPlayerTimeConsumed % 60;
  const secondPlayerTimeConsumedHours = Math.floor(secondPlayerTimeConsumed / 3600);
  const secondPlayerTimeConsumedMinutes = Math.floor((secondPlayerTimeConsumed % 3600) / 60);
  const secondPlayerTimeConsumedSeconds = secondPlayerTimeConsumed % 60;

  return (
    <div className={className} style={style}>
      <div className="w-full h-full p-3 flex flex-col gap-5">
        <div>
          <div>比赛地点</div>
          <div className="text-blue-500 font-bold text-lg">{matchLocation}</div>
        </div>
        <div>
          <div>比赛开始时间</div>
          <div className="text-blue-500 font-bold text-lg">{matchStartTime.toLocaleString()}</div>
        </div>
        <div className="flex flex-col gap-1">
          <div>
            <span>先手方({isBlackFirst ? "黑" : "白"}方)</span>
            &nbsp;
            <span className="text-blue-500 font-bold">{firstPlayer}</span>
            {
              isFirstPlayerTurn && (
                <span className="float-right text-green-500 font-bold">当前回合</span>
              )
            }
            {
              !isFirstPlayerTurn && lastMove && (
                <span className="float-right text-blue-500 font-bold">{lastMove}</span>
              )
            }
          </div>
          <div>
            <span>已用时间</span>
            &nbsp;
            <span className="float-right text-blue-500 font-bold">
              {
                firstPlayerTimeConsumedHours !== 0 && (
                  <span>{firstPlayerTimeConsumedHours}小时</span>
                )
              }
              {
                firstPlayerTimeConsumedMinutes !== 0 && (
                  <span>{firstPlayerTimeConsumedMinutes}分</span>
                )
              }
              <span>{firstPlayerTimeConsumedSeconds}秒</span>
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex flex-row justify-around">
              <Checkbox label="人工"
                        checked={!firstPlayerAIMode}
                        disabled={blockFirstPlayerAIControl}
                        onChange={() => {
                          if (!firstPlayerAIMode) {
                            return;
                          }
                          onFirstPlayerAIModeChange(false);
                        }} />
              <Checkbox label="AI"
                        checked={firstPlayerAIMode}
                        disabled={blockFirstPlayerAIControl}
                        onChange={() => {
                          if (firstPlayerAIMode) {
                            return;
                          }
                          onFirstPlayerAIModeChange(true);
                        }} />
            </div>
            {/*<Input placeholder="AI API URL"*/}
            {/*       value={firstPlayerAIUrl}*/}
            {/*       disabled={blockFirstPlayerAIControl}*/}
            {/*       onChange={(_, data) => onFirstPlayerAIUrlChange(data.value)} />*/}
            <Input placeholder="AI决策限时(秒) 为空则不限制"
                   value={firstPlayerAITimeLimit}
                   disabled={blockFirstPlayerAIControl}
                   onChange={(_, data) => onFirstPlayerAITimeLimitChange(data.value)} />
          </div>
          <Button onClick={() => {
            resignFuncRef.current = onFirstPlayerResign;
            setShowResignDialog(true);
          }}>
            认输
          </Button>
        </div>
        <div className="flex flex-col gap-1">
          <div>
            <span>后手方({isBlackFirst ? "白" : "黑"}方)</span>
            &nbsp;
            <span className="text-blue-500 font-bold">{secondPlayer}</span>
            {
              !isFirstPlayerTurn && (
                <span className="float-right text-green-500 font-bold">当前回合</span>
              )
            }
            {
              isFirstPlayerTurn && lastMove && (
                <span className="float-right text-blue-500 font-bold">{lastMove}</span>
              )
            }
          </div>
          <div>
            <span>已用时间</span>
            &nbsp;
            <span className="float-right text-blue-500 font-bold">
              {
                secondPlayerTimeConsumedHours !== 0 && (
                  <span>{secondPlayerTimeConsumedHours}小时</span>
                )
              }
              {
                secondPlayerTimeConsumedMinutes !== 0 && (
                  <span>{secondPlayerTimeConsumedMinutes}分</span>
                )
              }
              <span>{secondPlayerTimeConsumedSeconds}秒</span>
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex flex-row justify-around">
              <Checkbox label="人工"
                        checked={!secondPlayerAIMode}
                        disabled={blockSecondPlayerAIControl}
                        onChange={() => {
                          if (!secondPlayerAIMode) {
                            return;
                          }
                          onSecondPlayerAIModeChange(false);
                        }} />
              <Checkbox label="AI"
                        checked={secondPlayerAIMode}
                        disabled={blockSecondPlayerAIControl}
                        onChange={() => {
                          if (secondPlayerAIMode) {
                            return;
                          }
                          onSecondPlayerAIModeChange(true);
                        }} />
            </div>
            {/*<Input placeholder="AI API URL"*/}
            {/*       value={secondPlayerAIUrl}*/}
            {/*       disabled={blockSecondPlayerAIControl}*/}
            {/*       onChange={(_, data) => onSecondPlayerAIUrlChange(data.value)} />*/}
            <Input placeholder="AI决策限时(秒) 为空则不限制"
                   value={secondPlayerAITimeLimit}
                   disabled={blockSecondPlayerAIControl}
                   onChange={(_, data) => onSecondPlayerAITimeLimitChange(data.value)} />
          </div>
          <Button onClick={() => {
            resignFuncRef.current = onSecondPlayerResign;
            setShowResignDialog(true);
          }}>
            认输
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2 w-full">
          <Button onClick={onUndo}>悔棋</Button>
          {
            !replaceTerminateAsReturn && (
              <Button onClick={onTerminate}>强行终止</Button>)
          }
          {
            replaceTerminateAsReturn && (
              <Button onClick={onReturn}>返回</Button>)
          }
          {/*<Button onClick={onRestart}>重新开始</Button>*/}
          {/*<Button onClick={onViewLog}>查看日志</Button>*/}
        </div>
      </div>
      {
        <Dialog open={showResignDialog}
                modalType="modal"
                onOpenChange={(event, data) => setShowResignDialog(data.open)}>
          <DialogSurface className="w-80">
            <DialogBody>
              <DialogTitle>
                确定要认输吗？
              </DialogTitle>
              <DialogActions>
                <Button onClick={() => {
                  if (resignFuncRef.current) {
                    resignFuncRef.current();
                  }
                  setShowResignDialog(false);
                }}>
                  确定
                </Button>
                <Button appearance="primary"
                        onClick={() => setShowResignDialog(false)}>
                  取消
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      }
    </div>
  );
};

export default MatchPanel;
