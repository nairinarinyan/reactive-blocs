import { Observable, BehaviorSubject, of } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

type Executor<T> = () => Observable<T>;

function execAndForward<T>(exec: Executor<T>, subject: BehaviorSubject<T>, cb?: () => void) {
    exec().subscribe((val: any) => {
        subject.next(val);
        cb && cb();
    });
};

export function execAlways<T>(exec: Executor<T>, initialValue?: T) {
    const subject = new BehaviorSubject(initialValue);

    return new Observable(observer => {
        if (subject.getValue() === initialValue) {
            observer.next(initialValue);
        }

        execAndForward(exec, subject);

        subject.pipe(
            distinctUntilChanged()
        ).subscribe(val => val !== initialValue && observer.next(val));
    }) as Observable<T>;
}

export function execOnce<T>(exec: Executor<T>, initialValue?: T) {
    const subject = new BehaviorSubject(initialValue);
    execAndForward(exec, subject);

    return subject;
}

export function execControlled<T>(exec: Executor<T>, control: any, initialValue?: T, executeImmediately = true) {
    const subject = new BehaviorSubject(initialValue);

    const doExec = () => execAndForward(exec, subject, () => control(doExec));
    executeImmediately && doExec();

    return subject;
}
