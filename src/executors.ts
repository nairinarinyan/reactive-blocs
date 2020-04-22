import { Observable, BehaviorSubject, of, Subject } from 'rxjs';
import { distinctUntilChanged, catchError, share, switchMap, filter, tap } from 'rxjs/operators';
import { actionOf, dispatch } from './actions';

export type Executor<T, A = any> = (execArgs?: A) => Observable<T>;
export type ExecPerformer<A = any> = (execArgs?: A) => void;
export type Control<A = any> = (execPerformer: ExecPerformer<A>) => any;

function execAndForward<T, A>(exec: Executor<T, A>, subject: BehaviorSubject<T>, execArgs?: A) {
    exec(execArgs).subscribe((val: any) => {
        subject.next(val);
    });
};

export function execAlways<T, A = any>(exec: Executor<T, A>, initialValue?: T) {
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

export function execOnce<T, A = any>(exec: Executor<T, A>, initialValue?: T) {
    const subject = new BehaviorSubject(initialValue);
    execAndForward(exec, subject);

    return subject;
}

export function execControlled<T, A = any>(exec: Executor<T, A>, control: Control<A>, initialValue?: T, executeImmediately = true) {
    const subject = new BehaviorSubject(initialValue);

    const doExec: ExecPerformer<A> = (execArgs?: A) => execAndForward(exec, subject, execArgs);
    control(doExec);
    executeImmediately && doExec();

    return subject;
}

export class ExecSubject<T, A = any> extends BehaviorSubject<T> {
    private _execActionName = (Math.random() * (10000 - 100) + 100 << 0).toString();
    // private _executionStream = new Subject<A>();

    constructor(
        private _executor: Executor<T, A>,
        _initialValue?: T,
        private _initialParams?: A,
        private _error?: BehaviorSubject<Error>,
        private _loading?: BehaviorSubject<boolean>,
    ) {
        super(_initialValue);
        this.init();
        this._initialParams !== undefined && this.exec(_initialParams);
    }

    private init() {
        actionOf(this._execActionName, (args: A) => this.performExec(this._executor, args));

        // this._executionStream.pipe(
        //     switchMap(args => this.performExec(this._executor, args)),
        //     tap(error => {
        //         this._loading && this._loading.next(false);

        //         if (error instanceof Error && this._error) {
        //             this._error.next(error);
        //         }
        //     }),
        //     filter(result => !(result instanceof Error)),
        //     share(),
        // ).subscribe(val => this.next(val as T));
    }

    private performExec<T>(exec: Executor<T, A>, args: A) {
        return exec(args).pipe(
            catchError(err => of(new Error(err)))
        );
    };

    exec(args?: A) {
        this._loading && this._loading.next(true);
        // this._executionStream.next(args);

        const res = dispatch<A>(this._execActionName, args).pipe(
            tap(result => {
                this._loading && this._loading.next(false);

                if (result instanceof Error && this._error) {
                    this._error.next(result);
                }
            }),
            filter(result => !(this._error && result instanceof Error)),
            share(),
        ) as Observable<T>;

        res.subscribe(val => this.next(val as T));

        return res;
    }
}

export function exec<T, A = any>(
    exec: Executor<T, A>,
    initialValue?: T,
    initialParams?: A,
    error?: BehaviorSubject<Error>,
    loading?: BehaviorSubject<boolean>,
): ExecSubject<T, A> {
    return new ExecSubject<T, A>(exec, initialValue, initialParams, error, loading);
}