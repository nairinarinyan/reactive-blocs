import { Observable, BehaviorSubject, of, Subject, merge, Subscriber, Subscription, SubscriptionLike, throwError } from 'rxjs';
import { distinctUntilChanged, mergeMap, catchError, share, switchMap, filter, tap } from 'rxjs/operators';

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

export class ExecSubject<T> extends BehaviorSubject<T> {
    private _executionStream = new Subject<any>();

    constructor(
        private _executor: Executor<T>,
        _initialValue?: T,
        private _error ?: BehaviorSubject<Error>,
    ) {
        super(_initialValue);
        this.init();
    }

    private init() {
        this._executionStream.pipe(
            switchMap(args => this.performExec(this._executor, args)),
            tap(error => {
                if (error instanceof Error && this._error) {
                    this._error.next(error);
                }
            }),
            filter(result => !(result instanceof Error)),
            share(),
        ).subscribe(val => this.next(val as T));
    }

    private performExec<T>(exec: Executor<T>, args: any) { 
        return exec(args).pipe(
            catchError(err => of(new Error(err)))
        );
    };

    exec(args: any) {
        this._executionStream.next(args);
    }
}

export function exec<T>(exec: Executor<T>, initialValue?: T, error?: BehaviorSubject<Error>): ExecSubject<T> {
    return new ExecSubject<T>(exec, initialValue, error);
}