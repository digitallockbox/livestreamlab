import { useEffect, useState } from "react";
import Link from "next/link";
import RoleGate from "../../dashboard/shared/ui/RoleGate";
import { backendOrigin, getSession, saveSession } from "../../dashboard/shared/utils/session";

export default function BuyName() {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [myName, setMyName] = useState(null);
  const session = getSession();

  useEffect(() => {
    if (!session?.token) return;

    fetch(`${backendOrigin()}/web3/name/my`, {
      headers: { Authorization: `Bearer ${session.token}` },
    })
      .then((res) => res.json())
      .then((data) => setMyName(data))
      .catch(() => null);
  }, [session?.token]);

  const checkAvailability = async () => {
    const trimmed = name.trim().toLowerCase();
    if (!trimmed) {
      setStatus("INVALID_NAME");
      setMessage("Enter a name first.");
      return;
    }

    const res = await fetch(`${backendOrigin()}/web3/name/check?name=${encodeURIComponent(trimmed)}`);
    const data = await res.json();

    if (data.available) {
      setStatus("AVAILABLE");
      setMessage(`${trimmed}.livestreamlab is available.`);
      return;
    }

    setStatus(data.reason || "TAKEN");
    setMessage(`Name unavailable: ${data.reason || "TAKEN"}`);
  };

  const purchaseName = async () => {
    if (!session?.token) {
      setMessage("Login required.");
      return;
    }

    const res = await fetch(`${backendOrigin()}/web3/name/purchase`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
      },
      body: JSON.stringify({ name: name.trim().toLowerCase() }),
    });

    const data = await res.json();
    setStatus(data.status || "");

    if (data.status === "PURCHASED" || data.status === "ALREADY_OWNS_NAME") {
      setMessage(`Bound identity: ${data.identity}`);

      const refreshed = await fetch(`${backendOrigin()}/auth/session`, {
        headers: { Authorization: `Bearer ${session.token}` },
      }).then((r) => r.json());

      saveSession({ ...refreshed, token: session.token });
      const my = await fetch(`${backendOrigin()}/web3/name/my`, {
        headers: { Authorization: `Bearer ${session.token}` },
      }).then((r) => r.json());
      setMyName(my);
      return;
    }

    if (data.status === "INSUFFICIENT_BALANCE") {
      setMessage(`Need ${data.price} STREAMING tokens, you have ${data.balance}.`);
      return;
    }

    setMessage(`Purchase failed: ${data.status || "UNKNOWN"}`);
  };

  return (
    <RoleGate requiredRoles={["admin", "creator"]}>
      <main>
        <h1>Buy Your .livestreamlab Name</h1>
        <div className="card">
          <p>
            Your platform identity will look like <strong>username@livestreamlab</strong> and profile URL <strong>/u/username</strong>.
          </p>
          <p>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="creatorname"
            />
          </p>
          <p>
            <button onClick={checkAvailability}>Check</button>
            {status === "AVAILABLE" ? (
              <>
                {" "}
                <button onClick={purchaseName}>Purchase Name</button>
              </>
            ) : null}
          </p>
          <p>{message || status}</p>

          {myName?.hasName ? (
            <div>
              <p>Owned Name: {myName.domain}</p>
              <p>Identity: {myName.identity}</p>
              <p>
                Viewer profile: <Link href={myName.profileUrl || `/u/${myName.name}`}>{myName.profileUrl || `/u/${myName.name}`}</Link>
              </p>
              <p>Balance: {myName.balance} STREAMING</p>
            </div>
          ) : (
            <p>Mint price: {myName?.price || 500} STREAMING</p>
          )}
        </div>
      </main>
    </RoleGate>
  );
}
