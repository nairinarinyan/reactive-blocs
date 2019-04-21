import { useState, useEffect, useMemo } from 'react';
import { Observable } from 'rxjs';

export function useBloc<T>(field: Observable<T> | (() => Observable<T>)): T {
    let initialValue: T = null;
    let value: T = null;
    let setValue: any = null;

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