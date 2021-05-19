import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, skip, tap } from 'rxjs/operators';

// export class ReactiveValue<T> extends Observable<T> {
//   private bs: BehaviorSubject<T>;
//   // next(value: T): void;
//   constructor(initialValue?: T) {
//     super();

//     this.bs = new BehaviorSubject(initialValue);

//     const obs = this.bs.pipe(
//       skip(initialValue === undefined ? 1 : 0),
//       distinctUntilChanged(),
//     );
//   }

//   next(value: T) {
//     this.bs.next(value);
//   }

//   get value(): T {
//     return this.bs.getValue();
//   }
// }

export type ReactiveValue<T> = Observable<T> & {
  isReactive: boolean;
  value: T;
  next(value: T): void;
};

export const createValue = <T>(initialValue?: T) => {
  const bs = new BehaviorSubject(initialValue);

  const obs = bs.pipe(
    skip(initialValue === undefined ? 1 : 0),
    distinctUntilChanged(),
  );

  Object.defineProperties(obs, {
    value: {
      get() {
        return bs.value;
      }
    },
    next: {
      value(v: T) {
        bs.next(v);
      }
    },
    isReactive: {
      value: true
    }
  });

  return obs as ReactiveValue<T>;
};
