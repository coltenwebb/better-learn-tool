import React, { memo, useState } from "react";
import "./Item.css";
import { useDrag, useDrop } from "react-dnd";
import {
  appActions,
  ItemState,
  selectNextIntervals,
  selectRemainingTime,
} from "../features/app/appSlice";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import ReactDOM from "react-dom";

type DragItem = {
  uuid: string;
  draggedIndex: number;
};

const Item = ({ item, index }: { item: ItemState; index: number }) => {
  const items = useAppSelector((state) => state.app.items);
  const dispatch = useAppDispatch();

  const [isExpanded, setExpanded] = useState(false);

  const [{ isDragging }, drag] = useDrag(
    () => ({
      // "type" is required. It is used by the "accept" specification of drop targets.
      type: "item",
      item: { uuid: item.uuid, draggedIndex: index },
      // The collect function utilizes a "monitor" instance (see the Overview for what this is)
      // to pull important pieces of state from the DnD system.
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: ({ uuid: droppedUuid, draggedIndex }, monitor) => {
        if (!monitor.didDrop()) {
          dispatch(appActions.move({ uuid: droppedUuid, index: draggedIndex }));
        }
      },
    }),
    [dispatch, items, index]
  );

  const [, drop] = useDrop(
    () => ({
      accept: "item",
      hover({ uuid, draggedIndex }: DragItem) {
        if (uuid !== item.uuid) {
          dispatch(appActions.move({ uuid, index }));
        }
      },
    }),
    [dispatch, items, index]
  );

  return (
    <div
      ref={(node) => drag(drop(node))}
      style={{ opacity: isDragging ? 0 : 1 }}
      className="item"
    >
      {isExpanded ? (
        <ExpandedItem uuid={item.uuid} collapse={() => setExpanded(false)} />
      ) : (
        <CollapsedItem
          uuid={item.uuid}
          index={index}
          expand={() => setExpanded(true)}
        />
      )}
    </div>
  );
};

const CollapsedItem = ({ uuid, index, expand }) => {
  const item = useAppSelector((state) =>
    state.app.items.find((it) => it.uuid === uuid)
  );
  const remainingTime = useAppSelector(selectRemainingTime(uuid));

  const [scheduler, setScheduler] = useState(false);

  const [offset, setOffset] = useState(null);
  const measuredRef = React.useCallback(
    (node) => {
      if (node !== null) {
        setOffset(node.getBoundingClientRect());
      }
    },
    [index]
  );

  return (
    <>
      <span
        className="number-circle"
        ref={measuredRef}
        onClick={() => setScheduler(!scheduler)}
      >
        {formatRemainingTime(remainingTime)}
        {scheduler && (
          <Scheduler
            uuid={uuid}
            close={() => setScheduler(false)}
            offset={offset}
          />
        )}
      </span>
      <div className="label" onDoubleClick={expand}>
        {item?.label}
      </div>
    </>
  );
};

const formatRemainingTime = (time: number) => {
  if (time === -1) {
    return " "
  }
  // imprecise but good enough tbh
  if (time >= 30 * 10) return Math.round(time / 365) + "y";
  else if (time >= 30) return Math.floor(time / 30) + "m";
  else if (time >= 7) {
    return Math.floor(time / 7) + "w";
  } else {
    return time + "d";
  }
};

const ExpandedItem = ({ uuid, collapse }) => {
  const remainingTime = useAppSelector(selectRemainingTime(uuid));
  const item = useAppSelector((state) =>
    state.app.items.find((it) => it.uuid === uuid)
  );
  const dispatch = useAppDispatch();

  return (
    <>
      <span className="number-circle">
        {formatRemainingTime(remainingTime)}
      </span>
      <input
        className="label"
        type="text"
        onChange={(e) =>
          dispatch(
            appActions.update({ uuid: item.uuid, label: e.target.value })
          )
        }
        value={item.label}
        autoFocus
        onBlur={collapse}
        onKeyUp={(e) => {
          if (e.code === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
          }
        }}
      ></input>
    </>
  );
};

const Scheduler = ({ offset, close, uuid }) => {
  const dispatch = useAppDispatch();
  const nextIntervals = useAppSelector(selectNextIntervals(uuid));
  const style = offset
    ? {
        top: offset.top + offset.height / 2,
        left: offset.left + offset.width,
      }
    : {};

  return ReactDOM.createPortal(
    <div
      ref={(r) => r?.focus()}
      style={style}
      className="scheduler"
      tabIndex={0}
      onBlur={close}
    >
      {nextIntervals.map((nextInterval, idx) => (
        <button
          key={idx}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => dispatch(appActions.complete({ uuid, nextInterval }))}
        >
          {nextInterval} days
        </button>
      ))}
    </div>,
    document.querySelector("#portal")
  );
};

export default Item;
