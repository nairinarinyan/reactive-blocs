import { Observable, BehaviorSubject } from 'rxjs';
declare type Executor<T> = () => Observable<T>;
export declare function execAlways<T>(exec: Executor<T>, initialValue: T): Observable<{}>;
export declare function execOnce<T>(exec: Executor<T>, initialValue: T): BehaviorSubject<T>;
export declare function execControlled<T>(exec: Executor<T>, initialValue: T, control: any): BehaviorSubject<T>;
export {};
