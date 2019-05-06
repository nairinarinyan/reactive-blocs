# Reactive Blocs 
## Enhanced patterns and utilities for Reactive Functional Programming in React apps based on BLOC pattern

## ⚠ WIP

## Hooks
`useBloc<T>(field: Observable<T> | (() => Observable<T>)): T`

Given there is a Observable field in BLOC,  
`useBloc` is a hook that handles subscription/unsubscription of a React component to a Observable BLOC field.

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

When BLOC field emits a new value subscriber component rerenders

## Executors

### Main Types
### `Exectutor<T>`
Executor is any function which returns an observable

### `ExecPerformer = (...execArgs: any[]) => void`

### `Control = (execPerformer: ExecPerformer) => any`

### Execution helpers
### `execAlways<T>(exec: Executor<T>, initialValue?: T)`
`execAlways` is a function which executes the given executor on each subscription i.e. acts like a hot observable. But its execution context is shared between observables.

```ts
class ResourceBloc {
    public resources: BehaviorSubject<Resource[]>;

    resources = execAlways(() => httpService.get<Resource[]>('/resources'), []);
}
```

On first subscription subscriber gets the initial value immediately.
After executor completes, all subscribers get notified (rerendered).
On subsequent subscriptions subscriber component gets the latest result of the executions (e.g. latest value fetched from external service) and a new execution is initiated, and the result of which is being delivered to all subscribers.

### `execOnce<T>(exec: Executor<T>, initialValue?: T)`
Similiar to `execAlways` but the executor is executed only once.

### `execControlled<T>(exec: Executor<T>, control: Control, initialValue?: T, executeImmediately = true)`
Controlled execution. Gets `Control` argument, which is a function, that gets the `ExecPerformer` as an argument, which is a wrapped version of the passed executor. Each time the `ExecPerformer` is called, execution is initiated and the subscribers are informed upon completion.

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