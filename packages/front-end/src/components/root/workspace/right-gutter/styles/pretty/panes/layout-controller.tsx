import * as React from "react";
import { memoize, getParentTreeNode } from "tandem-common";
import { compose, pure, withHandlers } from "recompose";
import {
  cssPropertyChangeCompleted,
  cssPropertyChanged
} from "../../../../../../../actions";
import {
  DropdownMenuOption,
  dropdownMenuOptionFromValue
} from "../../../../../../inputs/dropdown/controller";
import {
  SyntheticVisibleNode,
  isSyntheticVisibleNodeMovable,
  isSyntheticVisibleNodeResizable,
  SyntheticDocument,
  isSyntheticElement
} from "paperclip";

export const DISPLAY_MENU_OPTIONS: DropdownMenuOption[] = [
  undefined,
  "block",
  "inline-block",
  "flex",
  "inline-flex",
  "none",
  "inline"
].map(dropdownMenuOptionFromValue);

export const POSITION_MENU_OPTIONS: DropdownMenuOption[] = [
  undefined,
  "static",
  "relative",
  "absolute",
  "fixed"
].map(dropdownMenuOptionFromValue);

const FLEX_WRAP_OPTIONS: DropdownMenuOption[] = [
  undefined,
  "nowrap",
  "wrap",
  "wrap-reverse"
].map(dropdownMenuOptionFromValue);
const FLEX_DIRECTION_OPTIONS: DropdownMenuOption[] = [
  undefined,
  "row",
  "row-reverse",
  "column",
  "column-reverse"
].map(dropdownMenuOptionFromValue);
const JUSTIFY_CONTENT_OPTIONS: DropdownMenuOption[] = [
  undefined,
  "flex-start",
  "flex-end",
  "center",
  "space-between",
  "space-around",
  "space-evenly"
].map(dropdownMenuOptionFromValue);
const ALIGN_ITEMS_OPTIONS: DropdownMenuOption[] = [
  undefined,
  "flex-start",
  "flex-end",
  "center",
  "stretch",
  "baseline"
].map(dropdownMenuOptionFromValue);
const ALIGN_CONTENT_OPTIONS: DropdownMenuOption[] = [
  undefined,
  "flex-start",
  "flex-end",
  "center",
  "space-between",
  "space-around",
  "stretch"
].map(dropdownMenuOptionFromValue);
const ALIGN_SELF_OPTIONS: DropdownMenuOption[] = [
  undefined,
  "flex-start",
  "flex-end",
  "center",
  "baseline",
  "stretch"
].map(dropdownMenuOptionFromValue);

export type LayoutControllerOuterProps = {
  selectedNodes: SyntheticVisibleNode[];
  syntheticDocument: SyntheticDocument;
};

export type LayoutControllerInnerProps = {
  onPropertyChangeComplete: any;
  onPropertyChange: any;
} & LayoutControllerOuterProps;

export default compose(
  pure,
  withHandlers({
    onClick: () => () => {},
    onPropertyChange: ({ dispatch }) => (name, value) => {
      dispatch(cssPropertyChanged(name, value));
    },
    onPropertyChangeComplete: ({ dispatch }) => (name, value) => {
      console.log("change complete", name, value);
      dispatch(cssPropertyChangeCompleted(name, value));
    }
  }),
  Base => ({
    onPropertyChange,
    onPropertyChangeComplete,
    selectedNodes,
    syntheticDocument
  }: LayoutControllerInnerProps) => {
    if (!selectedNodes) {
      return null;
    }
    const node = selectedNodes[0];
    const showMoveInputs = isSyntheticVisibleNodeMovable(node);
    const showSizeInputs = isSyntheticVisibleNodeResizable(node);
    const showParentFlexInputs = node.style.display === "flex";
    const parentNode: SyntheticVisibleNode = getParentTreeNode(
      node.id,
      syntheticDocument
    );
    const showChildFlexInputs =
      isSyntheticElement(parentNode) && parentNode.style.display === "flex";

    return (
      <Base
        displayInputProps={{
          value: node.style.display,
          options: DISPLAY_MENU_OPTIONS,
          onChangeComplete: propertyChangeCallback(
            "display",
            onPropertyChangeComplete
          )
        }}
        positionInputProps={{
          value: node.style.position,
          options: POSITION_MENU_OPTIONS,
          onChangeComplete: propertyChangeCallback(
            "position",
            onPropertyChangeComplete
          )
        }}
        leftInputProps={{
          value: node.style.left,
          onChangeComplete: propertyChangeCallback(
            "left",
            onPropertyChangeComplete
          )
        }}
        topInputProps={{
          value: node.style.top,
          onChangeComplete: propertyChangeCallback(
            "top",
            onPropertyChangeComplete
          )
        }}
        widthInputProps={{
          value: node.style.width,
          onChange: propertyChangeCallback("width", onPropertyChange),
          onChangeComplete: propertyChangeCallback(
            "width",
            onPropertyChangeComplete
          )
        }}
        heightInputProps={{
          value: node.style.height,
          onChange: propertyChangeCallback("height", onPropertyChange),
          onChangeComplete: propertyChangeCallback(
            "height",
            onPropertyChangeComplete
          )
        }}
        sizeControlsProps={{
          style: {
            display: showSizeInputs ? "flex" : "none"
          }
        }}
        moveControlsProps={{
          style: {
            display: showMoveInputs ? "flex" : "none"
          }
        }}
        flexDirectionInputProps={{
          value: node.style["flex-direction"],
          options: FLEX_DIRECTION_OPTIONS,
          onChangeComplete: propertyChangeCallback(
            "flex-direction",
            onPropertyChangeComplete
          )
        }}
        flexWrapInputProps={{
          value: node.style["flex-wrap"],
          options: FLEX_WRAP_OPTIONS,
          onChangeComplete: propertyChangeCallback(
            "flex-wrap",
            onPropertyChangeComplete
          )
        }}
        justifyContentInputProps={{
          value: node.style["justify-content"],
          options: JUSTIFY_CONTENT_OPTIONS,
          onChangeComplete: propertyChangeCallback(
            "justify-content",
            onPropertyChangeComplete
          )
        }}
        alignItemsInputProps={{
          value: node.style["align-items"],
          options: ALIGN_ITEMS_OPTIONS,
          onChangeComplete: propertyChangeCallback(
            "align-items",
            onPropertyChangeComplete
          )
        }}
        alignContentInputProps={{
          value: node.style["align-content"],
          options: ALIGN_CONTENT_OPTIONS,
          onChangeComplete: propertyChangeCallback(
            "align-content",
            onPropertyChangeComplete
          )
        }}
        flexBasisInputProps={{
          value: node.style["flex-basis"],
          onChange: propertyChangeCallback("flex-basis", onPropertyChange),
          onChangeComplete: propertyChangeCallback(
            "flex-basis",
            onPropertyChangeComplete
          )
        }}
        flexGrowInputProps={{
          value: node.style["flex-grow"],
          onChange: propertyChangeCallback("flex-grow", onPropertyChange),
          onChangeComplete: propertyChangeCallback(
            "flex-grow",
            onPropertyChangeComplete
          )
        }}
        flexShrinkInputProps={{
          value: node.style["flex-shrink"],
          onChange: propertyChangeCallback("flex-shrink", onPropertyChange),
          onChangeComplete: propertyChangeCallback(
            "flex-shrink",
            onPropertyChangeComplete
          )
        }}
        alignSelfInputProps={{
          value: node.style["align-self"],
          options: ALIGN_SELF_OPTIONS,
          onChangeComplete: propertyChangeCallback(
            "align-self",
            onPropertyChangeComplete
          )
        }}
        parentFlexboxControlsProps={{
          style: {
            display: showParentFlexInputs ? "block" : "none"
          }
        }}
        childFlexboxControlsProps={{
          style: {
            display: showChildFlexInputs ? "block" : "none"
          }
        }}
      />
    );
  }
);

const propertyChangeCallback = memoize((name: string, listener) => value =>
  listener(name, value)
);
