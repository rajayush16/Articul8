// import React from "react";

// const Loading = () => {
//   return (
//     <div className="w-[200px] m-auto mt-[200px]">
//       <p className="text-2xl text-blue-500 font-bold text-center">Loading...</p>
//     </div>
//   );
// };

// export default Loading;


'use client';
import { Spinner, type SpinnerProps } from '@/components/ui/shadcn-io/spinner';

const Loading = () => (
  <div className="h-screen w-screen flex justify-center items-center">
    <Spinner className="h-[50px] w-[50px] text-blue-500" variant="bars" />
  </div>
);

export default Loading;
