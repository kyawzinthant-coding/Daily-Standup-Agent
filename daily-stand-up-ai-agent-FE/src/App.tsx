import "./App.css";

import ListOfAgents from "./components/list-of-agents";
import ChatAgent from "./features/chat";

function App() {
  return (
    <div>
      <ListOfAgents />
      <ChatAgent />
    </div>
  );
}
export default App;
