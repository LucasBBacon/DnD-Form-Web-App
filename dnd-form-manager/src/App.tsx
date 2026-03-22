import { useState } from "react";
import "./App.css";
import { CombatStatsBlock } from "./components/CombatStatsBlock";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <CombatStatsBlock />
    </>
  );
}

export default App;
