import React, { useState } from "react";

export default function SocketDemoMessageInput({ send }) {
  const [value, setValue] = useState();

  return (
    <>
      <input onChange={(e) => setValue(e.target.value)} placeholder="Type your message..." value={value} />
      <button onClick={() => send(value)}>Send</button>
    </>
  );
}
