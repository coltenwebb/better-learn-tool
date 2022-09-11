import React from "react";
import { useDrag, useDrop } from "react-dnd";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { appActions, SubjectState } from "../features/app/appSlice";
import "./Subject.css";

type DragSubject = {
  uuid: string;
  draggedIndex: number;
};

type Props = {
  subject: SubjectState;
  index: number;
  onClick: any;
  isSelected: boolean;
};

export default function Subject({
  subject,
  index,
  onClick,
  isSelected,
}: Props) {
  const items = useAppSelector((state) => state.app.subjects);
  const dispatch = useAppDispatch();

  const [{ isDragging }, drag] = useDrag(
    () => ({
      // "type" is required. It is used by the "accept" specification of drop targets.
      type: "subject",
      item: { uuid: subject.uuid, draggedIndex: index },
      // The collect function utilizes a "monitor" instance (see the Overview for what this is)
      // to pull important pieces of state from the DnD system.
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: ({ uuid: droppedUuid, draggedIndex }, monitor) => {
        if (!monitor.didDrop()) {
          dispatch(
            appActions.moveSubject({ uuid: droppedUuid, index: draggedIndex })
          );
        }
      },
    }),
    [dispatch, items, index]
  );

  const [, drop] = useDrop(
    () => ({
      accept: "subject",
      hover({ uuid, draggedIndex }: DragSubject) {
        if (uuid !== subject.uuid) {
          dispatch(appActions.moveSubject({ uuid, index }));
        }
      },
    }),
    [dispatch, items, index]
  );

  const [{ isHovering }, drop2] = useDrop(
    () => ({
      accept: "item",
      collect: (monitor) => ({
        isHovering: monitor.isOver(),
      }),
      drop({ uuid, draggedIndex }: any) {
        dispatch(appActions.update({ uuid, subjectUuid: subject.uuid }));
      },
    }),
    [dispatch, items, index]
  );

  return (
    <div
      className={`subject ${isSelected ? "selected" : ""} ${
        isHovering ? "hovering" : ""
      }`}
      ref={(node) => drag(drop(drop2(node)))}
      style={{ opacity: isDragging ? 0 : 1, fontWeight: "normal" }}
      onMouseDown={onClick}
    >
      <div role="Handle">{subject.label || " "}</div>
    </div>
  );
}
