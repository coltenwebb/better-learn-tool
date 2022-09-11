import React from "react";
import "./Item.css";
import { useDrag } from "react-dnd";
import { ItemState, SubjectState } from "../features/app/appSlice";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import Item from "./Item";

type Props = {
  subject: SubjectState;
};

export default function ItemContainer({ subject }: Props) {
  const items = useAppSelector((state) => state.app.items);
  const dispatch = useAppDispatch();

  return (
    <div className="items">
      {items
        .filter((it) => it.subjectUuid === subject.uuid)
        .map((item) => (
          <Item key={item.uuid} item={item} index={items.indexOf(item)} />
        ))}
    </div>
  );
}
