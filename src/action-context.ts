import { Subject } from 'rxjs';
import { filter, mergeMap, map, take } from 'rxjs/operators';
import { generateId } from './utils';

export type Action<T = any> = {
  id: string;
  type: string;
  args: T;
};

export type ActionResult = {
  id: string;
  result: any;
};

type ActionHandler<A = any, R = any> = (args: A) => R;

const handleExecution = async <A = any>(action: Action, handler: ActionHandler<A>): Promise<ActionResult> => {
  const { id, args } = action;
  try {
    const result = await handler(args);
    return { id, result };
  } catch (err) {
    return { id, result: err };
  }
};

const createActionOf = (
  actionStream: Subject<Action>,
  responseStream: Subject<ActionResult>,
) => <A = any>(type: string, handler: ActionHandler<A>) => {
  return actionStream
    .pipe<Action, ActionResult>(
      filter(action => action.type === type),
      mergeMap(action => handleExecution(action, handler)),
    )
    .subscribe(result => responseStream.next(result));
};

const createDispatch = (
  actionStream: Subject<Action>,
  responseStream: Subject<ActionResult>,
) => <T = any>(type: string, args?: T) => {
  const action: Action = {
    id: generateId(),
    type, args
  };

  const res = responseStream.pipe(
    filter(r => r.id === action.id),
    map(r => r.result),
    take(1),
  );

  actionStream.next(action);

  return res;
};

export const createActionContext = () => {
  const actionStream = new Subject<Action>();
  const responseStream = new Subject<ActionResult>();

  const dispatch = createDispatch(actionStream, responseStream);
  const actionOf = createActionOf(actionStream, responseStream);

  return { dispatch, actionOf };
};
