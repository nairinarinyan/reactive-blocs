import { from } from 'rxjs';

type Args = { n: number, fail: boolean };

const doSomething = ({ n, fail }: Args) => {
  return Error('Loser')
  throw new Error('Loser')
  return n * n;
  const promise = new Promise<number>((resolve, reject) => {
    setTimeout(() => {
      if (fail) {
        reject(new Error('Failed to multiply'));
      } else {
        resolve(n * n);
      }
    }, 1000);
  });

  return promise;
  return from(promise);
};

const test = async () => {
  try {
    const result = await doSomething({ n: 10, fail: true });
    console.log(result);
  } catch (err) {
    console.log('err', err.message);
  }
};

test();