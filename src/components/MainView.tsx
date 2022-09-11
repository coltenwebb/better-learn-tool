import React, { useRef, useState } from "react";
import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { appActions } from "../features/app/appSlice";
import Item from "./Item";
import ItemContainer from "./ItemContainer";
import "./MainView.css";
import Subject from "./Subject";
import SubjectContainer from "./SubjectContainer";

export default function MainView() {
  const firstSubject = useAppSelector((state) => state.app.subjects[0]);
  const dispatch = useAppDispatch();

  const [selectedSubjectUuid, setSelectedSubjectUuid] = useState(
    firstSubject.uuid
  );
  const selectedSubject =
    useAppSelector((state) =>
      state.app.subjects.find((sub) => sub.uuid == selectedSubjectUuid)
    ) || firstSubject;

  return (
    <div className="main-view">
      <DndProvider backend={HTML5Backend}>
        <div className="sidebar">
          <SubjectContainer
            selectedSubject={selectedSubject}
            setSelectedSubjectUuid={setSelectedSubjectUuid}
          />
          <button
            className="add-subject"
            onClick={() => dispatch(appActions.addSubject())}
          >
            Add Subject
          </button>
          <TrashBin />
        </div>
        <div className="item-area">
          <input
            type="text"
            className="subject-title"
            value={selectedSubject?.label}
            onChange={(e) =>
              dispatch(
                appActions.updateSubject({
                  uuid: selectedSubject.uuid,
                  label: e.target.value,
                })
              )
            }
          />
          <ItemContainer subject={selectedSubject} />
          <button
            className="add-item"
            onClick={() => dispatch(appActions.add(selectedSubject.uuid))}
          >
            Add Item
          </button>
        </div>
      </DndProvider>
    </div>
  );
}

const TrashBin = () => {
  const dispatch = useAppDispatch();

  const [{ canDropSubject }, drop] = useDrop(
    () => ({
      accept: "subject",
      collect: (monitor) => ({
        canDropSubject: monitor.canDrop(),
      }),
      drop({ uuid, draggedIndex }) {
        dispatch(appActions.remove(uuid));
      },
    }),
    [dispatch]
  );

  const [{ canDropItem }, drop2] = useDrop(
    () => ({
      accept: "item",
      collect: (monitor) => ({
        canDropItem: monitor.canDrop(),
      }),
      drop({ uuid, draggedIndex }: any) {
        dispatch(appActions.remove(uuid));
      },
    }),
    [dispatch]
  );

  return (
    <>
      {(canDropItem || canDropSubject) && (
        <div className="trashbin" ref={(node) => drop(drop2(node))}>Delete</div>
      )}
    </>
  );
};
