import { useState, useEffect, useMemo, useRef } from 'react';
import { Observable } from 'rxjs';
import { ExecSubject, Executor } from './executors';
import { isPlainObject, compare } from './utils';

export function useBloc<T, A>(field: Observable<T> | (() => Observable<T>), args?: A): T {
    let initialValue: T = null;
    let value: T = null;
    let setValue: any = null;

    useExec<T, A>(args => (field as ExecSubject<T, A>).exec(args));

    const subscription = useMemo(() => {
        const subscription = (typeof field === 'function' ? field() : field).subscribe((val: T) => {
            if (setValue) {
                setValue(val);
            } else {
                initialValue = val;
            }
        });

        return subscription;
    }, []);

    useEffect(() => () => subscription.unsubscribe(), []);

    [value as T, setValue] = useState<T>(initialValue);

    return value;
}

export function useExec<T, A>(exec: (args: A) => any, args?: A) {
    const argsRef = useRef<A>(null);

    useMemo(() => {
        if (args == undefined) {
            return;
        }

        if (isPlainObject(args)) {
            if(!argsRef.current || !compare(argsRef.current, args)) {
                exec(args);
                argsRef.current = args;
            }
        } else {
            exec(args);
        }
    }, [args, argsRef.current]);

};