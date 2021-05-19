import { createTask } from '../src/tasks';

type Args = { n: number, fail: boolean };

const doSomething = ({ n, fail }: Args) => {
  return new Promise<number>((resolve, reject) => {
    setTimeout(() => {
      if (fail) {
        reject(new Error('Failed to multiply'));
      } else {
        resolve(n * n);
      }
    }, 100);
  });
};

const { result, execute, loading, error } = createTask<number, Args>(doSomething);

result.subscribe(val => console.log('value', val));
loading.subscribe(val => console.log('loading', val));
error.subscribe(val => console.log('error', val));

execute({ n: 10, fail: true })

setTimeout(() => {
  execute({ n: 20, fail: false })
}, 1000);

setTimeout(() => {
  execute({ n: 25, fail: true })
}, 2000);

setTimeout(() => {
  execute({ n: 30, fail: false })
}, 3000);