import { Subject, Observable, isObservable } from 'rxjs';
import { filter, mergeMap, map } from 'rxjs/operators';

export interface Action<T = any> {
    id?: number;
    type: string;
    args: T;
}

export interface ActionResult {
    id: number;
    result: any;
}

type ActionHandler<T = any> = (args: T) => any;

const actionStream = new Subject<Action>();
const responseStream = new Subject<ActionResult>();

export const actionOf = <T = any>(type: string, handler: ActionHandler<T>) => {
    return actionStream
        .pipe<Action, ActionResult>(
            filter(action => action.type === type),
            mergeMap(action => {
                const { id, args } = action;
                const response = handler(args);

                return new Observable<ActionResult>(obs => {
                    if (isObservable(response)) {
                        const sub = response.subscribe(result => {
                            obs.next({ id, result });
                            sub.unsubscribe();
                        });
                    } else {
                        obs.next({ id, result: response });
                    }
                });
            }),
        )
        .subscribe(result => responseStream.next(result));
};

export const dispatch = <T = any>(type: string, args?: T) => {
    const action: Action = {
        id: Math.random() * (100000 - 100) + 100 << 0,
        type, args
    };

    const res = responseStream.pipe(
        filter(r => r.id === action.id),
        map(r => r.result)
    );

    actionStream.next(action);

    return res;
};