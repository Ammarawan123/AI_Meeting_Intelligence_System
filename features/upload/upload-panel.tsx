"use client";

import { useReducer, useRef, useState } from "react";
import { CloudUpload, FileAudio, AlertCircle, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";

const ALLOWED_TYPES = ["audio/mpeg", "audio/wav", "audio/mp4", "video/mp4", "video/webm"];
const MAX_FILE_SIZE = 250 * 1024 * 1024;

const uploadFileSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, "File exceeds 250MB limit")
    .refine((file) => ALLOWED_TYPES.includes(file.type), "Unsupported file type. Use audio or video files."),
});

type UploadMachineState = {
  status: "idle" | "uploading" | "processing" | "completed" | "error";
  progress: number;
  error?: string;
  fileName?: string;
};

const initialState: UploadMachineState = { status: "idle", progress: 0 };

type UploadAction =
  | { type: "start"; fileName: string }
  | { type: "progress"; value: number }
  | { type: "processing" }
  | { type: "success" }
  | { type: "error"; error: string }
  | { type: "reset" };

function reducer(state: UploadMachineState, action: UploadAction): UploadMachineState {
  switch (action.type) {
    case "start":
      return { status: "uploading", progress: 8, fileName: action.fileName, error: undefined };
    case "progress":
      return { ...state, progress: Math.min(100, action.value) };
    case "processing":
      return { ...state, status: "processing", progress: 90 };
    case "success":
      return { status: "completed", progress: 100, fileName: state.fileName, error: undefined };
    case "error":
      return { status: "error", progress: 0, fileName: state.fileName, error: action.error };
    case "reset":
      return initialState;
    default:
      return state;
  }
}

export function UploadPanel() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [dragActive, setDragActive] = useState(false);

  const runUploadFlow = (file: File) => {
    const validated = uploadFileSchema.safeParse({ file });
    if (!validated.success) {
      dispatch({ type: "error", error: validated.error.issues[0]?.message ?? "Invalid file" });
      return;
    }

    dispatch({ type: "start", fileName: file.name });

    const progressSteps = [15, 35, 52, 68, 78, 90, 100];
    let index = 0;

    const interval = setInterval(() => {
      if (index >= progressSteps.length) {
        clearInterval(interval);
        dispatch({ type: "processing" });

        setTimeout(() => {
          dispatch({ type: "success" });
        }, 600);
        return;
      }

      dispatch({ type: "progress", value: progressSteps[index] });
      index += 1;
    }, 400);
  };

  const handleFile = (file?: File) => {
    if (!file) return;
    runUploadFlow(file);
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    handleFile(event.dataTransfer.files?.[0]);
  };

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">Upload</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Recordings</h2>
        </div>
        {state.status === "completed" ? (
          <Badge variant="success">Processing complete</Badge>
        ) : state.status === "error" ? (
          <Badge variant="danger">Needs attention</Badge>
        ) : (
          <Badge variant="warning">Ready</Badge>
        )}
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        className={`rounded-2xl border-2 border-dashed p-6 text-center transition ${
          dragActive ? "border-cyan-500 bg-cyan-50" : "border-slate-300 bg-slate-50"
        }`}
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-100 text-cyan-700">
          <CloudUpload className="h-8 w-8" />
        </div>
        <p className="mt-4 text-lg font-medium text-slate-800">Drop a recording here</p>
        <p className="mt-2 text-sm text-slate-500">Audio or video up to 250MB</p>
        <input
          ref={inputRef}
          type="file"
          accept=".mp3,.wav,.m4a,.mp4,.webm"
          className="hidden"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
        <div className="mt-4 flex justify-center gap-3">
          <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()}>
            Select file
          </Button>
          <Button type="button" variant="ghost" onClick={() => dispatch({ type: "reset" })}>
            Reset
          </Button>
        </div>
      </div>

      {state.status !== "idle" && (
        <div className="mt-6 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span className="flex items-center gap-2">
              {state.status === "completed" ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : state.status === "error" ? <AlertCircle className="h-4 w-4 text-rose-500" /> : <FileAudio className="h-4 w-4 text-cyan-600" />}
              {state.fileName ?? "Uploading recording"}
            </span>
            <span>{state.progress}%</span>
          </div>

          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full rounded-full transition-all ${
                state.status === "error" ? "bg-rose-500" : state.status === "completed" ? "bg-emerald-500" : "bg-cyan-500"
              }`}
              style={{ width: `${state.progress}%` }}
            />
          </div>

          {state.status === "processing" && <p className="text-sm text-slate-500">AI transcription and extraction are running.</p>}
          {state.status === "completed" && <p className="text-sm text-emerald-600">Upload complete and sent to the processing queue.</p>}
          {state.status === "error" && <p className="text-sm text-rose-600">{state.error}</p>}
        </div>
      )}
    </Card>
  );
}
