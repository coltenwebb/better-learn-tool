import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState, AppThunk } from "../../app/store";
import { v4 as uuidv4, v4 } from "uuid";
import { DateTime } from "luxon";

export type AppState = {
  categories: CategoryState[];
  subjects: SubjectState[];
  items: ItemState[];
};

export type CategoryState = {
  uuid: string;
  label: string;
};

export type SubjectState = {
  uuid: string;
  categoryUuid: string | null;
  label: string;
};

export type ItemState = {
  uuid: string;
  label: string;
  description: string;
  visible: boolean;
  subjectUuid: string | null;
  repInfo?: RepInfo;
};

export type RepInfo = {
  interval: number;
  lastCompletion: string; // iso date
};

const initialState: AppState = {
  categories: [],
  subjects: [],
  items: [],
};

const exampleState: AppState = {
  categories: [
    {
      uuid: "asdf",
      label: "some category",
    },
  ],
  subjects: [
    {
      uuid: "s1",
      categoryUuid: null,
      label: "subject1",
    },
    {
      uuid: "s2",
      categoryUuid: null,
      label: "subject2",
    },
  ],
  items: [
    {
      uuid: "i1",
      label: "item1",
      description: "",
      visible: true,
      subjectUuid: "s1",
    },
    {
      uuid: "i2",
      label: "item2",
      description: "",
      visible: true,
      subjectUuid: "s2",
    },
    {
      uuid: "i3",
      label: "item3",
      description: "",
      visible: true,
      subjectUuid: "s1",
    },
  ],
};

export type MovePayload = {
  uuid: string;
  index: number;
};

export type CompletePayload = {
  uuid: string;
  nextInterval: number;
};

export const appSlice = createSlice({
  name: "app",
  initialState: exampleState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    add: (state, action: PayloadAction<string>) => {
      state.items.push({
        uuid: uuidv4(),
        label: "new item",
        description: "",
        visible: true,
        subjectUuid: action.payload,
      });
    },
    addSubject: (state) => {
      state.subjects.push({
        uuid: uuidv4(),
        label: "new subject",
        categoryUuid: null,
      });
    },
    remove: (state, action: PayloadAction<string>) => {
      const itemindex = state.items.findIndex((it) => it.uuid === action.payload);
      if (itemindex !== -1) state.items.splice(itemindex, 1);

      const subjectindex = state.subjects.findIndex((sub) => sub.uuid === action.payload);
      if (subjectindex !== -1) {
        state.subjects.splice(subjectindex, 1);
        state.items = state.items.filter(it => it.subjectUuid !== action.payload)
      }
    },
    update: (
      state,
      action: PayloadAction<Partial<ItemState> & { uuid: string }>
    ) => {
      const idx = state.items.findIndex(
        (it) => it.uuid === action.payload.uuid
      );
      Object.assign(state.items[idx], action.payload);
    },
    updateSubject: (
      state,
      action: PayloadAction<Partial<SubjectState> & { uuid: string }>
    ) => {
      const idx = state.subjects.findIndex(
        (subject) => subject.uuid === action.payload.uuid
      );
      Object.assign(state.subjects[idx], action.payload);
    },
    move: (state, action: PayloadAction<MovePayload>) => {
      const curindex = state.items.findIndex(
        (it) => action.payload.uuid === it.uuid
      );
      if (curindex === -1) throw new Error("bad index");
      const tomove = state.items[curindex];
      state.items.splice(curindex, 1);
      state.items.splice(action.payload.index, 0, tomove);
    },
    moveSubject: (state, action: PayloadAction<MovePayload>) => {
      const curindex = state.subjects.findIndex(
        (it) => action.payload.uuid === it.uuid
      );
      if (curindex === -1) throw new Error("bad index");
      const tomove = state.subjects[curindex];
      state.subjects.splice(curindex, 1);
      state.subjects.splice(action.payload.index, 0, tomove);
    },
    complete: (state, action: PayloadAction<CompletePayload>) => {
      const idx = state.items.findIndex(
        (it) => it.uuid === action.payload.uuid
      );
      state.items[idx].repInfo = {
        lastCompletion: DateTime.now().toISODate(),
        interval: action.payload.nextInterval
      };
    }
  },
});

export const selectRemainingTime = (uuid: string) => (state: RootState) => {
  const item = selectItem(uuid)(state);
  if (item.repInfo) {
    const days = DateTime.now()
      .startOf("day")
      .diff(DateTime.fromISO(item.repInfo.lastCompletion), "days").days;
    return item.repInfo.interval - days
  } else {
    return -1
  }
};

export const selectItem = (uuid: string) => (state: RootState) => {
  const ret = state.app.items.find((it) => it.uuid === uuid);
  if (!ret) throw Error("bad uuid");
  return ret;
};

// array of integer numbers represent intervals in days
export const selectNextIntervals = (uuid: string) => (state: RootState) => {
  const item = selectItem(uuid)(state);
  if (item.repInfo) {
    const days = DateTime.now()
      .startOf("day")
      .diff(DateTime.fromISO(item.repInfo.lastCompletion), "days").days;
    const progress = Math.min(days / item.repInfo.interval, 1);
    const nextBaseInterval =
      item.repInfo.interval * (1 - progress + progress * 2.5);

    return [
      Math.ceil(nextBaseInterval * .7),
      Math.ceil(nextBaseInterval * 1),
      Math.ceil(nextBaseInterval * 1.2),
    ];
  } else {
    return [1, 3, 5];
  }
};

export const appActions = appSlice.actions;

const appReducer = appSlice.reducer;
export default appReducer;
