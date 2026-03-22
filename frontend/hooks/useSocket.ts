"use client";

import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useDispatch } from "react-redux";
import { setJobDone, setJobFailed, setJobProcessing } from "@/store/slices/paperSlice";
import { fetchResult } from "@/lib/api";

let socket: Socket | null = null;

export const useSocket = (assignmentId: string | null) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!socket) {
      socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000", {
        withCredentials: true,
        transports: ['polling', 'websocket'],
      });
    }

    if (!assignmentId) return;

    const joinRoom = () => {
      if (socket && assignmentId) {
        socket.emit("join", assignmentId);
        console.log(`[Socket] Joined room ${assignmentId}`);
      }
    };

    // Join immediately if connected
    if (socket.connected) {
      joinRoom();
    }

    // Always rejoin on connection/reconnection to ensure we don't miss events
    socket.on("connect", joinRoom);
    
    // Handlers
    const onProcessing = () => {
      dispatch(setJobProcessing());
    };
    
    const onDone = async (data: { resultId: string; assignmentId: string }) => {
      try {
        const res = await fetchResult(data.assignmentId);
        dispatch(setJobDone({ result: res.data.data }));
      } catch (err: any) {
        dispatch(setJobFailed({ error: "Result fetch failed after generation." }));
      }
    };

    const failedHandler = (data: { message: string }) => {
      dispatch(setJobFailed({ error: data.message }));
    };

    socket.off("job:processing");
    socket.off("job:done");
    socket.off("job:failed");

    socket.on("job:processing", onProcessing);
    socket.on("job:done", onDone);
    socket.on("job:failed", failedHandler);

    return () => {
      socket?.off("connect", joinRoom);
      socket?.off("job:processing", onProcessing);
      socket?.off("job:done", onDone);
      socket?.off("job:failed", failedHandler);
    };
  }, [assignmentId, dispatch]);
};
