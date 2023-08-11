import { BehaviorSubject } from 'rxjs';
import { share, filter, tap } from 'rxjs/operators';
import { createActionContext } from'./action-context';
import { createValue, ReactiveValue } from './primitives';
import { generateId } from './utils';

export type Executor<T, A> = (execArgs: A) => Promise<T> | T;

export type Task<T, A, E extends Error> = {
  result: ReactiveValue<T>;
  execute(args?: A, ignoreError?: boolean): Promise<T | null>;
  loading: BehaviorSubject<boolean>;
  error: BehaviorSubject<E | null>;
};

export const createTask = <T, A, E extends Error = Error>(
  executor: Executor<T, A>,
  initialValue?: T,
  initialParams?: A,
): Task<T, A, E> => {
  const { actionOf, dispatch } = createActionContext();
  const actionName = generateId();

  const result = createValue(initialValue);
  const loading = new BehaviorSubject(false);
  const error = new BehaviorSubject<E | null>(null);

  const reset = () => {
    if (result.value !== initialValue) {
      result.next(initialValue as T);
    }

    loading.next(true);
    error.next(null);
  };

  const execute = (args?: A, ignoreErorr?: boolean): Promise<T | null> => {
    loading.next(true);
    error.next(null);

    return new Promise((resolve, reject) => {
      const actionResult = dispatch(actionName, args).pipe(
        tap(() => loading.next(false)),
        filter(res => {
          if (res instanceof Error) {
            error.next(res as E);
            ignoreErorr ? resolve(null) : reject(res)
            return false;
          } else {
            error.next(null);
            resolve(res);
            return true;
          }
        }),
        share()
      );

      actionResult.subscribe(val => result.next(val));
    });
  };

  if (initialParams !== undefined) {
    execute(initialParams);
  }

  actionOf(actionName, (args: A) => {
    return executor(args);
  });

  return { result, loading, error, execute };
};
