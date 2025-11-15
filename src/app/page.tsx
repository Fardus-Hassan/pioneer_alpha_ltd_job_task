"use client";

import { useEffect } from "react";


export default function Home() {

    useEffect(() => {
      if (localStorage.getItem("access_token")) {
        window.location.href = "/dashboard";
      }
      else {
        window.location.href = "/login";
      }
    }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Welcome to Dreamy Software!</h1>
    </div>
  );
}
