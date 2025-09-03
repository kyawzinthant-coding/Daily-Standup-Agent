import "./App.css";

import ListOfAgents from "./components/list-of-agents";
import ChatAgent from "./features/chat";

function App() {
  return (
    <div className="w-full h-full">
      <ListOfAgents />
      <ChatAgent />
    </div>
  );
}
export default App;
