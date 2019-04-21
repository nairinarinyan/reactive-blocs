import { Observable, BehaviorSubject } from 'rxjs';
declare type Executor<T> = () => Observable<T>;
export declare function execAlways<T>(exec: Executor<T>, initialValue?: T): Observable<{}>;
export declare function execOnce<T>(exec: Executor<T>, initialValue?: T): BehaviorSubject<T | undefined>;
export declare function execControlled<T>(exec: Executor<T>, control: any, initialValue?: T): BehaviorSubject<T | undefined>;
export {};
