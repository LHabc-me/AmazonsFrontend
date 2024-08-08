import { contextBridge } from "electron";
import { electronAPI } from "@electron-toolkit/preload";
import { createMatchDetail, createMatchInfo, getAllMatchInfo, getMatchDetail, initMatchModels, removeMatchDetail, removeMatchInfo, setWinner } from "../main/match_record";

// Custom APIs for renderer
const api = {
  initMatchModels,
  createMatchInfo,
  removeMatchInfo,
  setWinner,
  createMatchDetail,
  removeMatchDetail,
  getAllMatchInfo,
  getMatchDetail
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = electronAPI;
  window.api = api;
}
