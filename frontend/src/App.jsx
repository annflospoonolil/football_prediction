import { useState } from "react";
import Home from "./pages/Home";
import Match from "./pages/Match";

export default function App() {
  const [selectedMatchId, setSelectedMatchId] = useState(null);

  return selectedMatchId ? (
    <Match matchId={selectedMatchId} goBack={() => setSelectedMatchId(null)} />
  ) : (
    <Home onSelectMatch={setSelectedMatchId} />
  );
}
