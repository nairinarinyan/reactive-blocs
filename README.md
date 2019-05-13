# Reactive Blocs 
## Enhanced patterns and utilities for Reactive Functional Programming in React apps based on BLOC pattern

## ⚠ WIP

# Abstract
BLOC stands for Business Logic Component. It was originally created at Google for Flutter apps.  
This repository is a collection of utilities and guides for applying BLOC pattern in React apps using Reactive Functional Programming techniques.  
It also introduces new concepts such as `link`, `executors` and others.

# Hooks
`useBloc<T>(field: Observable<T> | (() => Observable<T>)): T`

`useBloc` is a hook that handles subscription/unsubscription of a React component to an Observable BLOC field.

**resource.bloc.ts**
```ts
class ResourceBloc {
    resources = new BehaviorSubject<Resource[]([])>;
}

export const resourceBloc = new ResourceBloc()
```

**resource.tsx**
```ts
const resources = useBloc(resourceBloc.resources);
```

When BLOC field emits a new value subscriber component is rerendered

# Executors

## Main Types
### `Executor<T>`
`Executor` is any function which returns an observable.
Used in exec helpers.

### `ExecPerformer = (...execArgs: any[]) => void`
`ExecPerformer` is a wrapped executor passed to all exec helpers. It is passed to the `Control` function in `execControlled`.


### `Control = (execPerformer: ExecPerformer) => any`
`Control` is the second argument passed to `execControlled`. It gives a possibility to control the execution. `ExecPerformer` is passed to this function as the only argument.
Each time the `ExecPerformer` is called, execution is initiated and the subscribers are informed upon completion.

## Execution helpers
### `execAlways<T>(exec: Executor<T>, initialValue?: T)`
`execAlways` executes the given executor on each subscription i.e. acts like a hot observable. But its execution context is shared between observables.  
On first subscription subscriber gets the initial value immediately.
After executor completes, all subscribers get notified (rerendered).
On subsequent subscriptions subscriber component gets the latest result of the executions (e.g. latest value fetched from external service) and a new execution is initiated, the result of which is being delivered to all subscribers.

```ts
class ResourceBloc {
    public resources: BehaviorSubject<Resource[]>;

    resources = execAlways(() => httpService.get<Resource[]>('/resources'), []);
}
```

### `execOnce<T>(exec: Executor<T>, initialValue?: T)`
Similiar to `execAlways` but the executor is executed only once.

### `execControlled<T>(exec: Executor<T>, control: Control, initialValue?: T, executeImmediately = true)`
Controlled execution. Gets `Control` argument, which is a function, that gets the `ExecPerformer` as an argument, which is a wrapped version of the passed executor.

```ts
class ResourceBloc {
    public resources: BehaviorSubject<Resource[]>;
    private fetchResources: ExecPerformer;
    
    resources = execControlled<Resource[]>(
        secondaryResource => httpService.get<Resource[]>(`/resources?secondaryResource=${secondaryResource}`),
        fetchResources => this.fetchResources = fetchResources,
    []);
    
    init() {
        this.secondaryResource.pipe(
            filter(Boolean),
        ).subscribe(this.fetchResources);
    }
}
```

# Link

`link: (source: Observable<any>, target: Subject<any>, labels?: string[]) => void`

One of the most important advantage of reactive/push-based systems is that you can declaratively describe connections between parts of business logic at "**construction time**".  
It means you get **declarative**, **transparent** and **obvious** connections of your business logic graph. Which gives us a possibility to draw our business logic as a graph where nodes `BLOC`s, and edges are `Link`s.  
Creating DevTools supporting this mechanism is in progress.

`link` function creates a link between two BLOCs. BLOC `Link` is a "reactive connection" between BLOC input and output streams. 
Those are `Observable` fields, often `Subjects` or `BehaviorSubjects`.

```ts
import { Subject, throwError } from 'rxjs';
import { execOnce, link } from 'reactive-blocs';
import { httpService } from '../services/http.service';
import { mapTo, catchError } from 'rxjs/operators';

class AuthBloc {
    isLoggedIn = execOnce(() => httpService.get('/me').pipe(mapTo(true)), null);
    error = new Subject();

    constructor() {
        link(httpService.authError, this.isLoggedIn);
        link(this.error, notificationBloc.receiver);
    }

    login(email: string, password: string) {
        httpService.post('/login', { email, password }, true).pipe(
            catchError(err => {
                this.error.next('Wrong credentials');
                return throwError(err);
            })
        )
        .subscribe(() => this.isLoggedIn.next(true));
    }
}

export const authBloc = new AuthBloc();
```

In this example the login state is initially `null`, then it's defined by making a single call to `/me` api endpoint.  

`httpService.authError` is an output stream describing an auth error (e.g. result of an http call was `401`).  
At construction time we create a link between `httpService.authError` and current `isLoggedIn` state.  

Then we link `this.error` and `notificationBloc.receiver` which is an input stream of `notificationBloc`. This is useful when a wrong credentials are used during login and `this.error` emits in `catchError`.  `notificationBloc.receiver` is reported about it and it shows a notification.  


**notification.bloc.tsx**
```ts
import { Observable, of, merge, BehaviorSubject, Subject } from 'rxjs';
import { switchMap, delay } from 'rxjs/operators';

export class Notification {
    constructor(public message: string, public shown: boolean) {}
}

class NotificationBloc {
    receiver = new Subject();
    notification = new BehaviorSubject<Notification>(new Notification(null, false));

    constructor() {
        this.receiver.pipe(
                switchMap(this.createMessageStream)
            )
            .subscribe(message => this.notification.next(message));
    }

    private createMessageStream(message: string): Observable<Notification> {
        const messageStream = of(new Notification(message, true));
        const resetStream = of(new Notification(message, false)).pipe(delay(2000));

        return merge(messageStream, resetStream);
    }
}

export const notificationBloc = new NotificationBloc();
```

**notification.tsx**
```tsx
import React from 'react';
import { useBloc } from 'reactive-blocs';
import { classes } from 'react-scoped-styles';
import { notificationBloc } from './notification.bloc';

import './notification.styl';

export const Notification = () => {
    const { shown, message } = useBloc(notificationBloc.notification);

    return (
        <div className={classes('notification', [shown, 'shown'])}>
            {message}
        </div>
    )
};
```