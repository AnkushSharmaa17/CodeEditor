import React from "react";
import { Editor } from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import { useRef, useMemo, useState, useEffect } from "react";
import * as Y from "yjs";
import { SocketIOProvider } from "y-socket.io";
function App() {
  const editorRef = useRef(null);
  const [username, setUsername] = useState(() => {
    return new URLSearchParams(window.location.search).get("username") || "";
  });
  const [users, setUsers] = useState([]);
  const ydoc = useMemo(() => new Y.Doc(), []);
  const ytext = useMemo(() => ydoc.getText("monaco"), [ydoc]);

  const handlemount = (editor) => {
    editorRef.current = editor
    new MonacoBinding(
      ytext,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
    );
  };
 const handlejoin = (e) => {
    e.preventDefault()
    setUsername(e.target.username.value);
    window.history.pushState({}, "", "?username=" + e.target.username.value);
  };
  useEffect(() => {
    if (username) {
      // niche vali line is most important because this line is connect user  frontend  edit code to connect with server
      const provider = new SocketIOProvider(
        "/",
        "monaco",
        ydoc,
        { autoConnect: true },
      );
      provider.awareness.setLocalStateField("user", { username });
      const states = Array.from(provider.awareness.getStates().values());
      setUsers(states.filter(state => state.user && state.user.username).map(state => state.user),
      );
      provider.awareness.on("change", () => {
        const states = Array.from(provider.awareness.getStates().values());
        setUsers(
          states.filter((state) => state.user && state.user.username).map(state => state.user),
        )
      }) 
      function handleBeforeUnload() {
        provider.awareness.setLocalState("user", null);
      }
      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        provider.disconnect()
        window.removeEventListener("beforeunload", handleBeforeUnload);
      }
    }
  }
 , [username]
)

 

  if (!username) {
    return (
      <main className="bg-zinc-950 h-screen w-full flex gap-4 p-3 justify-center items-center ">
        <form onSubmit={handlejoin} action="" className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Username"
            name="username"
            className="outline-none h-10 w-30 bg-zinc-400 rounded-md p-2"
          />
          <button className="p-2 h-10 w-30 bg-blue-700 rounded-md">Join</button>
        </form>
      </main>
    );
  }

  return (
    <main className="bg-zinc-950 h-screen w-full flex gap-4 p-3 ">
      <aside className="bg-zinc-400 h-full w-1/5 rounded-md">
        <h2 className="text-2xl p-2 text-black">Users</h2>
        <ul className="p-4">
          {users.map((user, index) => (
            <li
              key={index}
              className="p-2 mb-2 rounded-md text-white bg-gray-800 border-gray-800"
            >
              {user.username}
            </li>
          ))}
        </ul>
      </aside>
      <section className="bg-zinc-700 h-full w-4/5 rounded-md">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          theme="vs-dark"
          defaultValue="// some coments"
          onMount={handlemount}
        />
      </section>
    </main>
  );
}

export default App;
