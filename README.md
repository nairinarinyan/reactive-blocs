# Reactive Blocs 
## Enhanced patterns and utilities for Reactive Functional Programming in React apps based on BLOC pattern

## ⚠ WIP

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