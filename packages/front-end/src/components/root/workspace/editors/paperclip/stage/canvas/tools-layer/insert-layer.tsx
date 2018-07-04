import "./insert-layer.scss";
import * as React from "react";
import { compose, pure, withHandlers, withState } from "recompose";
import { Canvas, ToolType, EditorWindow } from "../../../../../../../../state";
import { insertToolFinished } from "../../../../../../../../actions";
import { Dispatch } from "redux";
import { startDOMDrag, Bounds, getBoundsSize } from "tandem-common";

type InsertLayerOuterProps = {
  toolType: ToolType;
  canvas: Canvas;
  editorWindow: EditorWindow;
  dispatch: Dispatch<any>;
};

type InsertLayerInnerProps = {
  previewBounds: Bounds;
  setPreviewBounds: (bounds: Bounds) => any;
  onMouseDown: (event: React.MouseEvent<any>) => any;
} & InsertLayerOuterProps;

const CURSOR_MAP = {
  [ToolType.COMPONENT]: "crosshair",
  [ToolType.ELEMENT]: "crosshair",
  [ToolType.ARTBOARD]: "crosshair",
  [ToolType.TEXT]: "text"
};

const TEXT_PADDING = 5;

const BaseInsertLayer = ({
  canvas,
  toolType,
  editorWindow,
  onMouseDown,
  previewBounds
}: InsertLayerInnerProps) => {
  if (toolType == null) {
    return null;
  }
  const translate = canvas.translate;

  const outerStyle = {
    cursor: CURSOR_MAP[toolType] || "default",
    transform: `translate(${-translate.left /
      translate.zoom}px, ${-translate.top / translate.zoom}px) scale(${1 /
      translate.zoom}) translateZ(0)`,
    transformOrigin: `top left`
  };

  let preview;

  if (previewBounds) {
    const { width, height } = getBoundsSize(previewBounds);
    preview = (
      <div>
        <div
          className="preview"
          style={{
            left: previewBounds.left,
            top: previewBounds.top,
            width,
            height
          }}
        />
        <div
          className="preview-text"
          style={{
            left: previewBounds.left + width + TEXT_PADDING,
            top: previewBounds.top + height + TEXT_PADDING
          }}
        >
          {width} x {height}
        </div>
      </div>
    );
  }

  return (
    <div
      className="m-insert-layer"
      style={outerStyle}
      onMouseDown={onMouseDown}
    >
      {preview}
    </div>
  );
};

const enhance = compose<InsertLayerInnerProps, InsertLayerOuterProps>(
  pure,
  withState("previewBounds", "setPreviewBounds", null),
  withHandlers({
    onMouseDown: ({ editorWindow, dispatch }: InsertLayerInnerProps) => (
      startEvent: React.MouseEvent<any>
    ) => {
      const startX = startEvent.clientX;
      const startY = startEvent.clientY;
      dispatch(
        insertToolFinished(
          {
            left: startX,
            top: startY
          },
          editorWindow.activeFilePath
        )
      );
    }
  })
);

export const InsertLayer = enhance(BaseInsertLayer);
