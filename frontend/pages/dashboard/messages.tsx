import { useState } from "react";
import RoleGate from "../../src/dashboard/shared/ui/RoleGate";
import {
  getMessageThread,
  markMessageThreadRead,
  sendMessage,
} from "../../src/dashboard/api/engine/engine-bridge";

export default function MessagesPage() {
  const [threadId, setThreadId] = useState("general");
  const [text, setText] = useState("");
  const [threadPayload, setThreadPayload] = useState<unknown>(null);
  const [status, setStatus] = useState("Ready.");

  async function loadThread() {
    const res = await getMessageThread(threadId.trim() || "general");
    if (!res.ok) {
      setStatus(res.error || "Unable to load message thread");
      return;
    }

    setThreadPayload(res.data);
    setStatus("Thread loaded");
  }

  async function onSend() {
    if (!text.trim()) {
      setStatus("Enter a message before sending");
      return;
    }

    const res = await sendMessage({
      threadId: threadId.trim() || "general",
      text: text.trim(),
    });

    if (!res.ok) {
      setStatus(res.error || "Unable to send message");
      return;
    }

    setText("");
    await loadThread();
  }

  async function onMarkRead() {
    const res = await markMessageThreadRead(threadId.trim() || "general");
    if (!res.ok) {
      setStatus(res.error || "Unable to mark thread read");
      return;
    }

    setStatus("Thread marked read");
  }

  return (
    <RoleGate requiredRoles={["admin", "creator"]}>
      <main className="space-y-4 text-white">
        <h1 className="text-2xl font-bold">Messages</h1>

        <section className="card space-y-3">
          <label className="block">
            Thread ID
            <input
              className="mt-1 w-full rounded border border-gray-700 bg-gray-950 px-3 py-2"
              value={threadId}
              onChange={(event) => setThreadId(event.target.value)}
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <button className="rounded bg-blue-600 px-4 py-2" onClick={loadThread}>
              Load Thread
            </button>
            <button className="rounded bg-gray-700 px-4 py-2" onClick={onMarkRead}>
              Mark Read
            </button>
          </div>

          <label className="block">
            Message
            <textarea
              className="mt-1 w-full rounded border border-gray-700 bg-gray-950 px-3 py-2"
              rows={3}
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
          </label>
          <button className="rounded bg-emerald-600 px-4 py-2" onClick={onSend}>
            Send Message
          </button>

          <pre className="overflow-auto rounded bg-black/40 p-3 text-xs">
            {JSON.stringify(threadPayload, null, 2)}
          </pre>
          <p className="text-sm text-gray-300">{status}</p>
        </section>
      </main>
    </RoleGate>
  );
}
