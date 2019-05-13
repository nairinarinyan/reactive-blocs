import { Observable, BehaviorSubject, of } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

export type Executor<T> = (...execArgs: any[]) => Observable<T>;
export type ExecPerformer = (...execArgs: any[]) => void;
export type Control = (execPerformer: ExecPerformer) => any;

function execAndForward<T>(exec: Executor<T>, subject: BehaviorSubject<T>, execArgs: any[] = []) {
    exec(...execArgs).subscribe((val: any) => {
        subject.next(val);
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

export function execControlled<T>(exec: Executor<T>, control: Control, initialValue?: T, executeImmediately = true) {
    const subject = new BehaviorSubject(initialValue);

    const doExec: ExecPerformer = (...execArgs: any[]) => execAndForward(exec, subject, execArgs);
    control(doExec);
    executeImmediately && doExec();

    return subject;
}
