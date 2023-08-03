import { useEffect, useState } from "react";
import { Task } from "../tasks";

type Handles<T> = {
  result: T, 
  loading: boolean,
  error: Error | null,
};

export const useTask = <T, A>(task: Task<T, A>): Handles<T> => {
  const [result, setResult] = useState(task.result.value);
  const [loading, setLoading] = useState(task.loading.value);
  const [error, setError] = useState(task.error.value);

  useEffect(() => {
    const subs = [
      task.result.subscribe(setResult),
      task.loading.subscribe(setLoading),
      task.error.subscribe(setError),
    ];

    return () => subs.forEach(s => s.unsubscribe());
  }, [task]);

  return { result, loading, error };
};
