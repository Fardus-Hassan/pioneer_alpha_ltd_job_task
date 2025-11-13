"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { increment, decrement } from "../redux/slices/counterSlice";

export default function Home() {
  const count = useSelector((state: RootState) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Counter App ⚡</h1>
      <p className="text-xl mb-6">Count: {count}</p>
      <div className="space-x-4">
        <button
          onClick={() => dispatch(decrement())}
          className="px-4 py-2 bg-red-500 text-white rounded-md"
        >
          -
        </button>
        <button
          onClick={() => dispatch(increment())}
          className="px-4 py-2 bg-green-500 text-white rounded-md"
        >
          +
        </button>
      </div>
    </div>
  );
}
