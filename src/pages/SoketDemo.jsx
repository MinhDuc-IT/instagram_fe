import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import io, { Socket } from "socket.io-client";
import SocketDemoMessageInput from "../components/SocketDemoMessageInput";
import SocketDemoMessages from "../components/SocketDemoMessages";

export default function SoketDemo() {
  const [socket, setSocket] = useState();
  const [messages, setMessages] = useState([]);

  const send = (value) => {
    socket?.emit("message", value);
  };

  useEffect(() => {
    const newSocket = io("http://localhost:8001");
    setSocket(newSocket);
  }, [setSocket]);

  const messageListener = (message) => {
    setMessages([...messages, message]);
  };

  useEffect(() => {
    socket?.on("message", messageListener);
    return () => {
      socket?.off("message", messageListener);
    };
  }, [messageListener]);

  return (
    <>
      <SocketDemoMessageInput send={send} />
      <SocketDemoMessages messages={messages} />
    </>
  );
}
