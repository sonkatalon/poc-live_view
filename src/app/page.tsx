"use client";

import { ElementRef, useCallback, useEffect, useRef, useState } from "react";

import { Device } from "@/models";
import { createDevice, destroyDevice } from "@/server-actions/devices";

const width = 800;
const height = 600;

type RecordState = "done" | "creating" | "recording" | "destroying";

function renderNotice(recordState: RecordState): string {
  switch (recordState) {
    case "done":
      return 'Enter an URL and click "Record" to start recording...';
    case "creating":
      return "Creating device...";
    case "recording":
      return 'Click "Done" to stop.';
    case "destroying":
      return "Destroying device...";
  }
}

export default function Home() {
  const [recordState, setRecordState] = useState<RecordState>("done");
  const [device, setDevice] = useState<Device | null>(null);
  const urlRef = useRef<ElementRef<"input">>(null);
  const rfbRef = useRef<ElementRef<"div">>(null);

  const startRecording = useCallback(async () => {
    setRecordState("creating");
    setDevice(
      await createDevice({ url: urlRef.current?.value ?? "", width, height })
    );
    setRecordState("recording");
  }, [setRecordState]);
  const stopRecording = useCallback(async () => {
    if (device !== null) {
      setRecordState("destroying");
      await destroyDevice(device?.hostPort);
    }
    setDevice(null);
    setRecordState("done");
  }, [device, setDevice, setRecordState]);

  useEffect(() => {
    (async () => {
      const { current } = rfbRef;
      if (device !== null && current != null) {
        const RFB = (await import("@novnc/novnc/core/rfb")).default;
        new RFB(current, device.rfbUrl);
      }
    })();
  }, [device]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          {renderNotice(recordState)}
        </div>
      </div>

      <div className="mb-32 flex text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:text-left">
        <input
          className="flex-grow m-2 p-2"
          disabled={recordState !== "done"}
          placeholder="https://domain.com"
          ref={urlRef}
        />
        {recordState === "done" ? (
          <button className="w-20" onClick={startRecording}>
            Record
          </button>
        ) : (
          <button
            className="w-20"
            disabled={recordState !== "recording"}
            onClick={stopRecording}
          >
            Done
          </button>
        )}
      </div>

      <div
        style={{ width: `${width}px`, height: `${height}px` }}
        ref={rfbRef}
      ></div>
    </main>
  );
}
