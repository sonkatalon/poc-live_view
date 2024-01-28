"use client";

import { ElementRef, useCallback, useEffect, useRef, useState } from "react";

import { Device } from "@/models";
import { createDevice, destroyDevice } from "@/server-actions/devices";

const width = 800;
const height = 600;

type RecordState = "done" | "creating" | "recording" | "destroying";

function renderNotice(recordState: RecordState, logs: string[]): string {
  switch (recordState) {
    case "done":
      return 'Enter an URL and click "Record" to start recording...';
    case "creating":
      return "Creating device...";
    case "recording":
      if (logs.length > 0) {
        return `[LOG] ${logs[logs.length - 1]}`;
      }
      return 'Click "Done" to stop.';
    case "destroying":
      return "Destroying device...";
  }
}

export default function Home() {
  const [recordState, setRecordState] = useState<RecordState>("done");
  const [device, setDevice] = useState<Device | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const urlRef = useRef<ElementRef<"input">>(null);
  const rfbRef = useRef<ElementRef<"div">>(null);

  const startRecording = useCallback(async () => {
    setRecordState("creating");
    setLogs([]);
    setDevice(
      await createDevice({
        hostname: window.location.hostname,
        isSecure: window.location.protocol === "https:",
        url: urlRef.current?.value ?? "",
        width,
        height,
      })
    );
    setRecordState("recording");
  }, [setRecordState, setLogs]);
  const stopRecording = useCallback(async () => {
    if (device !== null) {
      setRecordState("destroying");
      await destroyDevice(device?.hostPort);
    }
    setDevice(null);
    setRecordState("done");
  }, [device, setDevice, setRecordState]);

  useEffect(() => {
    (async function loadRfb() {
      const { current } = rfbRef;
      if (device !== null && current != null) {
        const RFB = (await import("@novnc/novnc/core/rfb")).default;
        new RFB(current, device.rfbUrl);
      }
    })();
  }, [device, rfbRef]);

  useEffect(() => {
    (async function loadSocketIo() {
      const { io } = await import("socket.io-client");
      const socket = io();
      socket.on("click", (data: { target: string }) => {
        setLogs((logs) => [...logs, `Clicked: ${data.target}`]);
      });
    })();
  }, [setLogs]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          {renderNotice(recordState, logs)}
        </div>
      </div>

      <form className="mb-32 flex text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:text-left">
        <input
          className="flex-grow m-2 p-2"
          defaultValue="https://news.ycombinator.com"
          disabled={recordState !== "done"}
          placeholder="https://domain.com"
          ref={urlRef}
          type="url"
        />
        {recordState === "done" ? (
          <input
            className="w-20"
            onClick={startRecording}
            type="submit"
            value="Record"
          />
        ) : (
          <input
            className="w-20"
            disabled={recordState !== "recording"}
            onClick={stopRecording}
            type="submit"
            value="Done"
          />
        )}
      </form>

      <div
        style={{ width: `${width}px`, height: `${height}px` }}
        ref={rfbRef}
      ></div>
    </main>
  );
}
