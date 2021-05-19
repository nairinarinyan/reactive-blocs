import { BehaviorSubject } from 'rxjs';
import { share, filter } from 'rxjs/operators';
import { createActionContext } from'./action-context';
import { createValue, ReactiveValue } from './primitives';

export type Executor<T, A> = (execArgs: A) => Promise<T> | T;

export type Task<T, A> = {
    result: ReactiveValue<T>;
    execute(args?: A): Promise<T>;
    loading: BehaviorSubject<boolean>;
    error: BehaviorSubject<Error>;
};

// export type ExecPerformer<A = any> = (execArgs?: A) => void;
// export type Control<A = any> = (execPerformer: ExecPerformer<A>) => any;

export const createTask = <T, A>(
    executor: Executor<T, A>,
    initialValue?: T,
    initialParams?: A,
): Task<T, A> => {
    const { actionOf, dispatch } = createActionContext();
    const actionName = (Math.random() * 1000000 << 0).toString(16);

    const result = createValue(initialValue);
    const loading = new BehaviorSubject(false);
    const error = new BehaviorSubject<Error>(null);

    const execute = (args?: A): Promise<T> => {
        loading.next(true);
        error.next(null);

        return new Promise((resolve, reject) => {
            const actionResult = dispatch(actionName, args).pipe(
                filter(res => {
                    loading.next(false)

                    if (res instanceof Error) {
                        error.next(res);
                        reject(res);
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

    return { result, execute, loading, error };
};
