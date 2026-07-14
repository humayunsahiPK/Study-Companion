import { useEffect, useRef, useState } from "react";

export type LectureStatus = "processing" | "done";

let mockPollCount = 0;

async function fetchLectureStatus(lectureId: string): Promise<LectureStatus> {
  mockPollCount += 1;
  if (mockPollCount >= 3) {
    return "done";
  }
  return "processing";
}

export function useLectureStatus(
  lectureId: string,
  initialStatus: LectureStatus,
  intervalMs = 4000,
) {
  const [status, setStatus] = useState<LectureStatus>(initialStatus);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (status === "done") return;

    intervalRef.current = setInterval(async () => {
      const latest = await fetchLectureStatus(lectureId);
      setStatus(latest);
      if (latest === "done" && intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }, intervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [lectureId, status, intervalMs]);

  return status;
}
