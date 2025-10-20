import React from "react";

export default function SocketDemoMessages({ messages }) {
  return (
    <div>
        {messages.map((message, index) => (
            <div key={index}>{message}</div>
        ))}
    </div>
  )
}
