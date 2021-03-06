import { eventChannel } from "redux-saga";
import { take, fork, select, call, put, spawn } from "redux-saga/effects";
import {
  pcFrameRendered,
  pcFrameContainerCreated,
  pcRuntimeEvaluated,
  PC_RUNTIME_EVALUATED,
  PCRuntimeEvaluated
} from "./actions";
import {
  SyntheticNativeNodeMap,
  renderDOM,
  patchDOM,
  computeDisplayInfo
} from "./dom-renderer";
import { KeyValue, getNestedTreeNodeById, EMPTY_ARRAY } from "tandem-common";
import { DependencyGraph } from "./graph";
import { TreeNodeOperationalTransform } from "./ot";
import { PCEditorState, Frame, getSyntheticDocumentFrames } from "./edit";
import {
  getSyntheticNodeById,
  SyntheticDocument,
  SyntheticVisibleNode,
  getSyntheticDocumentByDependencyUri
} from "./synthetic";
import { PCRuntime } from "./runtime";

export type PaperclipSagaOptions = {
  createRuntime(): PCRuntime;
};

export const createPaperclipSaga = ({ createRuntime }: PaperclipSagaOptions) =>
  function* paperclipSaga() {
    yield fork(runtime);
    yield fork(nativeRenderer);

    function* runtime() {
      const rt = createRuntime();

      const chan = eventChannel(emit => {
        rt.on(
          "evaluate",
          (newDocuments, diffs, deletedDocumentIds, timestamp) => {
            emit(
              pcRuntimeEvaluated(
                newDocuments,
                diffs,
                rt.syntheticDocuments,
                timestamp < rt.lastUpdatedAt
              )
            );
          }
        );
        return () => {};
      });

      yield fork(function*() {
        while (1) {
          yield put(yield take(chan));
        }
      });

      while (1) {
        yield take();
        const state: PCEditorState = yield select();
        rt.setGraph(state.graph);
      }
    }

    const initedFrames = {};

    function* nativeRenderer() {
      yield fork(function* captureFrameChanges() {
        let prevState: PCEditorState;
        while (1) {
          const { diffs }: PCRuntimeEvaluated = yield take(
            PC_RUNTIME_EVALUATED
          );
          const state: PCEditorState = yield select();

          const allDocUris = Object.keys(state.graph);

          for (const uri of allDocUris) {
            const newDocument = getSyntheticDocumentByDependencyUri(
              uri,
              state.documents,
              state.graph
            );

            if (!newDocument) {
              continue;
            }
            const ots = diffs[uri] || EMPTY_ARRAY;

            for (const newFrame of getSyntheticDocumentFrames(
              newDocument,
              state.frames
            )) {
              if (!initedFrames[newFrame.contentNodeId]) {
                initedFrames[newFrame.contentNodeId] = true;
                yield spawn(initContainer, newFrame, state.graph);
              } else {
                const frameOts = mapContentNodeOperationalTransforms(
                  newFrame.contentNodeId,
                  newDocument,
                  ots
                );
                const oldFrameFrame =
                  prevState &&
                  prevState.frames.find(
                    oldFrame =>
                      oldFrame.contentNodeId === newFrame.contentNodeId
                  );
                if (frameOts.length || newFrame !== oldFrameFrame) {
                  const oldDocument = getSyntheticDocumentByDependencyUri(
                    uri,
                    prevState.documents,
                    prevState.graph
                  );

                  yield spawn(
                    patchContainer,
                    newFrame,
                    getNestedTreeNodeById(newFrame.contentNodeId, oldDocument),
                    frameOts
                  );
                }
              }
            }
          }

          prevState = state;
        }
      });
    }

    const mapContentNodeOperationalTransforms = (
      contentNodeId: string,
      document: SyntheticDocument,
      ots: TreeNodeOperationalTransform[]
    ) => {
      const index = document.children.findIndex(
        child => child.id === contentNodeId
      );
      return ots.filter(ot => ot.nodePath[0] === index).map(ot => ({
        ...ot,
        nodePath: ot.nodePath.slice(1)
      }));
    };

    const frameNodeMap: KeyValue<SyntheticNativeNodeMap> = {};

    function* initContainer(frame: Frame, graph: DependencyGraph) {
      const container = createContainer();

      // notify of the new container
      yield put(pcFrameContainerCreated(frame, container));
      yield call(watchContainer, container, frame, graph);
    }

    // FIXME: This produces memory leaks when frames are removed from the store.
    function* watchContainer(container: HTMLElement, frame: Frame) {
      const iframe = container.children[0] as HTMLIFrameElement;
      // wait until it's been mounted, then continue
      const eventChan = eventChannel(emit => {
        const onUnload = () => {
          iframe.contentWindow.removeEventListener("unload", onUnload);
          resetContainer(container);
          emit("unload");
        };
        const onDone = () => {
          iframe.contentWindow.addEventListener("unload", onUnload);
          iframe.removeEventListener("load", onDone);
          emit("load");
        };

        iframe.addEventListener("load", onDone);
        if (iframe.contentDocument && iframe.contentDocument.body) {
          setImmediate(onDone);
        }

        return () => {};
      });

      while (1) {
        const eventType = yield take(eventChan);
        if (eventType === "load") {
          const state: PCEditorState = yield select();
          const contentNode = getSyntheticNodeById(
            frame.contentNodeId,
            state.documents
          );
          const graph = state.graph;
          const body = iframe.contentDocument.body;
          yield put(
            pcFrameRendered(
              frame,
              computeDisplayInfo(
                (frameNodeMap[frame.contentNodeId] = renderDOM(
                  body,
                  contentNode
                ))
              )
            )
          );
        } else if (eventType === "unload") {
          break;
        }
      }

      yield call(watchContainer, container, frame);
    }

    function* patchContainer(
      frame: Frame,
      contentNode: SyntheticVisibleNode,
      ots: TreeNodeOperationalTransform[]
    ) {
      const container: HTMLElement = frame.$container;
      const iframe = container.children[0] as HTMLIFrameElement;
      const body = iframe.contentDocument && iframe.contentDocument.body;
      if (!body) {
        return;
      }

      frameNodeMap[frame.contentNodeId] = patchDOM(
        ots,
        contentNode,
        body,
        frameNodeMap[frame.contentNodeId]
      );

      yield put(
        pcFrameRendered(
          frame,
          computeDisplayInfo(frameNodeMap[frame.contentNodeId])
        )
      );
    }
  };

const createContainer = () => {
  if (typeof window === "undefined") return null;
  const container = document.createElement("div");
  container.appendChild(createIframe());
  return container;
};

const resetContainer = (container: HTMLElement) => {
  container.removeChild(container.children[0]);
  container.appendChild(createIframe());
};

const createIframe = () => {
  const iframe = document.createElement("iframe");
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.background = "white";
  iframe.addEventListener("load", () => {
    iframe.contentDocument.body.style.margin = "0";
  });
  return iframe;
};
