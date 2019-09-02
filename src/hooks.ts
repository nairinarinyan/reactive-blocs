import { useState, useEffect, useMemo, useRef } from 'react';
import { Observable } from 'rxjs';
import { ExecSubject } from './executors';

const isPlainObject = (obj: any) =>
    typeof obj === 'object' &&
        obj !== null &&
        obj.constructor === Object

const compare = (obj1: any, obj2: any) =>
    Object.keys(obj1).length === Object.keys(obj2).length &&
    Object.keys(obj1).every(key => obj2.hasOwnProperty(key) && obj1[key] === obj2[key]);

export function useBloc<T, A>(field: Observable<T> | (() => Observable<T>), args?: A): T {
    let initialValue: T = null;
    let value: T = null;
    let setValue: any = null;

    const argsRef = useRef<A>(null);

    useMemo(() => {
        if (args == undefined && !(field instanceof ExecSubject)) {
            return;
        }

        if (isPlainObject(args)) {
            if(!argsRef.current || !compare(argsRef.current, args)) {
                (field as ExecSubject<T, A>).exec(args);
                argsRef.current = args;
            }
        } else {
           (field as ExecSubject<T, A>).exec(args);
        }
    }, [args, argsRef.current]);

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