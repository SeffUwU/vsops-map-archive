import type React from 'react';
import type { VSMap } from '../types/toggles-state';

export interface ITogglerProps {
  setTogglesState: React.Dispatch<React.SetStateAction<VSMap.TogglesState>>;
  toggleState: VSMap.TogglesState;
}

export function Toggler({ setTogglesState: setToggleState, toggleState }: ITogglerProps) {
  const handleClick = (event) => {
    // Try an alert
    console.log('typeof console:', typeof console); // What is this?
    console.log('console.log:', console.log); // Is it undefined?
    console.log('window.console.log:', window.console.log); // This should work!
    console.debug('done');
  };

  // const setupHandler = (name: keyof VSMap.TogglesState) => {
  //   return (e: React.MouseEvent) => {
  //     console.log(1);
  //     e.stopPropagation();
  //     setToggleState((prev) => {
  //       console.log(prev);
  //       return {
  //         ...prev,
  //         [name]: !prev[name],
  //       };
  //     });
  //   };
  // };

  return (
    <div className="absolute top-1 left-1 bg-zinc-700 rounded-md flex flex-row gap-4  p-2 ">
      <button onClick={handleClick} className="pointer-events-auto">
        CHUNKS
      </button>
      {/* <button onClick={setupHandler("landmarks")}>LANDMARKS</button>
      <button onClick={setupHandler("traders")}>TRADERS</button>
      <button onClick={setupHandler("translocators")}>TPs</button> */}
    </div>
  );
}
