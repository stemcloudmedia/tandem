import { fork, call, take, select, put } from "redux-saga/effects";
import { electronSaga } from "./electron";
import { BrowserWindow } from "electron";
import { APP_READY } from "../actions";
import { FRONT_END_ENTRY_FILE_PATH } from "../constants";
import { ipcSaga, pid } from "./ipc";
import { APP_LOADED, projectDirectoryLoaded, convertFlatFilesToNested } from "tandem-front-end";
import { DesktopState } from "../state";
import * as globby from "globby";
import { isPublicAction } from "tandem-common";

export function* rootSaga() {
  yield fork(openMainWindow);
  yield fork(electronSaga);
  yield fork(ipcSaga)
  yield fork(handleLoadProject);
}

function* openMainWindow() {
  yield take(APP_READY);

  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600
  });

  mainWindow.loadURL(FRONT_END_ENTRY_FILE_PATH);

  yield fork(function*() {
    while(1) {
      const message = yield take();
      if (isPublicAction(message) && !message["@@" + pid]) {
        mainWindow.webContents.send("message", message);
      }
    }
  });
}

function* handleLoadProject() {
  while(1) {
    yield take(APP_LOADED);
    const state: DesktopState = yield select();
    const files = globby.sync(state.projectDirectory, {
      gitignore: true
    } as any);

    const root = convertFlatFilesToNested(state.projectDirectory, files);
    yield put(projectDirectoryLoaded(root));
  }
}