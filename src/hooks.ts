import { useState, useEffect, useMemo, useRef } from 'react';
import { BehaviorSubject, Observable } from 'rxjs';
import { ReactiveValue } from './primitives';
import { isPlainObject, compare } from './utils';

const isReactive = <T>(field: Observable<T> | ReactiveValue<T>): field is ReactiveValue<T> => {
    return (field as ReactiveValue<T>).isReactive;
};

export function useBloc<T>(field: Observable<T> | ReactiveValue<T> | BehaviorSubject<T>, label?: string): T {
    let initialValue: T = isReactive(field) ? field.value : undefined;
    let value: T = undefined;
    let setValue: any = null;

    const subscription = useMemo(() => {
        const subscription = field.subscribe((val: T) => {
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

export function useExec<T, A = any>(exec: (args: A) => any, args?: A) {
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