"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";

export default function Home() {

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Welcome to Dreamy Software!</h1>
    </div>
  );
}
