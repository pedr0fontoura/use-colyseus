import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import colyseusLogo from "./assets/colyseus.png";

import "./App.css";

import {
  connectToColyseus,
  disconnectFromColyseus,
  useColyseusState,
} from "./colyseus";
import { useEffect } from "react";

function App() {
  const networkTime = useColyseusState((state) => state.networkTime);

  useEffect(() => {
    (async () => {
      await connectToColyseus("test");
    })();

    return () => {
      disconnectFromColyseus();
    };
  }, []);

  if (!networkTime) return null;

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
        <a href="https://colyseus.io/" target="_blank">
          <img
            src={colyseusLogo}
            className="logo colyseus"
            alt="Colyseus logo"
          />
        </a>
      </div>
      <h1>Vite + React + Colyseus</h1>
      <p>{networkTime}</p>
      <p className="read-the-docs">
        Click on the Vite, React and Colyseus logos to learn more
      </p>
    </>
  );
}

export default App;
