import React from "react";
import "./Item.css";
import { useDrag } from "react-dnd";
import { ItemState, SubjectState } from "../features/app/appSlice";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import Item from "./Item";
import Subject from "./Subject";

type Props = {
  selectedSubject: SubjectState;
  setSelectedSubjectUuid: (uuid: string) => void;
};

export default function SubjectContainer({
  selectedSubject,
  setSelectedSubjectUuid,
}: Props) {
  const subjects = useAppSelector((state) => state.app.subjects);
  const dispatch = useAppDispatch();

  return (
    <div className="subjects">
      {subjects.map((subject, idx) => (
        <Subject
          key={subject.uuid}
          subject={subject}
          index={idx}
          onClick={() => setSelectedSubjectUuid(subject.uuid)}
          isSelected={selectedSubject.uuid === subject.uuid}
        />
      ))}
    </div>
  );
}
