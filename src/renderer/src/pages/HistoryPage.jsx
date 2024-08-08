import { useContext, useEffect, useState } from "react";
import { Button, Checkbox, Dialog, DialogActions, DialogBody, DialogSurface, DialogTitle, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from "@fluentui/react-components";
import { exportMatchDetail } from "../export";
import ToastContext from "../contexts/ToastContext";

function HistoryPage(props) {
  const {
    className,
    style,
    onReturn
  } = props;

  const [matchInfo, setMatchInfo] = useState([]);
  const matchHeaders = [
    "对局编号",
    "对局时间",
    "对局地点",
    "赛事名称",
    "棋盘大小",
    "先手队伍",
    "后手队伍",
    "胜利队伍"
  ];
  const [checkedMatchIds, setCheckedMatchIds] = useState([]);
  const [showConfirmRemoveSelected, setShowConfirmRemoveSelected] = useState(false);

  const toast = useContext(ToastContext);

  async function exportSelected() {
    const dir = await window.electron.ipcRenderer.invoke("choose-directory");
    if (!dir) {
      return;
    }
    try {
      const matches = matchInfo.filter(match => checkedMatchIds.includes(match.id));
      const detailsPromises = matches.map(match => window.api.getMatchDetail(match.id));
      const details = await Promise.all(detailsPromises);
      const detailsExport = [];
      const detailsExportPromises = [];
      for (let i = 0; i < matches.length; ++i) {
        detailsExport.push(exportMatchDetail(matches[i], details[i], dir));
      }
      for (let i = 0; i < detailsExport.length; ++i) {
        const { outputPath, file_name, file_content } = detailsExport[i];
        detailsExportPromises.push(window.electron.ipcRenderer.invoke("write-file", outputPath, file_name, file_content));
      }
      await Promise.all(detailsExportPromises);
      toast.success("导出成功", `共导出${matches.length}条记录`);
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function removeSelected() {
    try {
      setShowConfirmRemoveSelected(false);
      if (checkedMatchIds.length === 0) {
        toast.error("删除失败", "未选中对局记录");
        return;
      }
      await window.api.removeMatchInfo(checkedMatchIds);
      toast.success("删除成功", `共删除${checkedMatchIds.length}条记录`);
      setCheckedMatchIds([]);
      reload();
    } catch (e) {
      toast.error(e.message);
    }
  }

  function reload() {
    window.api.getAllMatchInfo()
      .then((matchInfo) => {
        setMatchInfo(matchInfo);
      });
  }

  useEffect(() => {
    reload();
  }, []);

  function allChecked() {
    if (
      checkedMatchIds.length === matchInfo.length &&
      matchInfo.length !== 0) {
      return true;
    } else if (checkedMatchIds.length === 0) {
      return false;
    } else {
      return "mixed";
    }
  }

  return (
    <div className={className} style={style}>
      <div className="p-3">
        <div className="float-right flex flex-row gap-5 mb-5">
          <Button onClick={exportSelected}>导出选中项</Button>
          <Button onClick={() => setShowConfirmRemoveSelected(true)}>删除选中项</Button>
          <Button appearance="primary" onClick={onReturn}>返回</Button>
        </div>
        <div>
          <Table role="grid">
            <TableHeader>
              <TableRow>
                <TableCell className="w-14">
                  <Checkbox checked={allChecked()}
                            onChange={(_, data) => {
                              if (data.checked) {
                                setCheckedMatchIds(matchInfo.map(match => match.id));
                              } else {
                                setCheckedMatchIds([]);
                              }
                            }} />
                </TableCell>
                {
                  matchHeaders.map((key, index) => (
                    <TableHeaderCell key={index}>
                      {key}
                    </TableHeaderCell>
                  ))
                }
              </TableRow>
            </TableHeader>
            <TableBody>
              {
                matchInfo.map((match, index) => (
                  <TableRow key={index}>
                    <TableCell tabIndex={0} role="gridcell">
                      <Checkbox checked={checkedMatchIds.includes(match.id)}
                                onChange={(_, data) => {
                                  setCheckedMatchIds((ids) => {
                                    if (data.checked) {
                                      return [...ids, match.id];
                                    } else {
                                      return ids.filter(id => id !== match.id);
                                    }
                                  });
                                }} />
                    </TableCell>
                    <TableCell tabIndex={0} role="gridcell">
                      {match.id}
                    </TableCell>
                    <TableCell tabIndex={0} role="gridcell">
                      {match.time.toLocaleString()}
                    </TableCell>
                    <TableCell tabIndex={0} role="gridcell">
                      {match.location}
                    </TableCell>
                    <TableCell tabIndex={0} role="gridcell">
                      {match.name}
                    </TableCell>
                    <TableCell tabIndex={0} role="gridcell">
                      {match.board_size}x{match.board_size}
                    </TableCell>
                    <TableCell tabIndex={0} role="gridcell">
                      {match.first_team}
                    </TableCell>
                    <TableCell tabIndex={0} role="gridcell">
                      {match.second_team}
                    </TableCell>
                    <TableCell tabIndex={0} role="gridcell">
                      {match.winner}
                    </TableCell>
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
        </div>
      </div>
      {
        <Dialog open={showConfirmRemoveSelected}
                onOpenChange={(event, data) => setShowConfirmRemoveSelected(data.open)}>
          <DialogSurface className="w-96">
            <DialogBody>
              <DialogTitle>
                确定要删除选中的对局记录吗？
              </DialogTitle>
              <DialogActions>
                <Button onClick={removeSelected}>确定</Button>
                <Button appearance="primary"
                        onClick={() => setShowConfirmRemoveSelected(false)}>
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


export default HistoryPage;
