import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

interface Event {
    from: string;
    to: string;
    payload: any;
}

const unique = (arr: string[]) => [...new Set(arr)];

export const blocs = new BehaviorSubject<string[]>([]);
export const events = new BehaviorSubject<Event[]>([]);

export const currentEvent = events.pipe(
    map(events => events[events.length - 1])
);

export const link = (source: Observable<any>, target: Subject<any>, labels?: string[]) => {
    if (labels) {
        blocs.next(unique(blocs.getValue().concat(labels)));
    }

    source.subscribe(val => {
        if (labels) {
            const [from, to] = labels;
            const event: Event = {
                from, to,
                payload: val
            };
    
            events.next(events.getValue().concat(event));
        }

        target.next(val);
    });
}