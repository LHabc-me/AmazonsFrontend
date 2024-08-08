import MatchPage from "./pages/MatchPage";
import HomePage from "./pages/HomePage";
import HistoryPage from "./pages/HistoryPage";
import { useState } from "react";

function App() {
  const [activePage, setActivePage] = useState("home");
  const [matchConfig, setMatchConfig] = useState({});

  return (
    <div className="h-screen w-screen">
      {
        activePage === "home" && (
          <HomePage className="h-full w-full"
                    onNewMatch={(config) => {
                      setMatchConfig(config);
                      setActivePage("match");
                    }}
                    onShowHistory={() => setActivePage("history")} />
        )
      }
      {
        activePage === "match" && (
          <MatchPage className="h-full w-full"
                     onMatchEnd={() => setActivePage("home")}
                     {...matchConfig} />
        )
      }
      {
        activePage === "history" && (
          <HistoryPage className="h-full w-full"
                       onReturn={() => setActivePage("home")} />
        )
      }
    </div>
  );
}

export default App;

