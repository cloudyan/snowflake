import SnowFlake from '../src/snowflake';

const idWorker = new SnowFlake(1n, 1n, 0n);

//  测试
function checkOrderAsc() {
  console.time('id');

  const tempIds = [];
  for (let i = 0; i < 50000; i++) {
    const id = idWorker.nextId();
    // console.log(id);
    tempIds.push(id);
  }
  console.log(tempIds.length);
  // const end = +new Date();
  console.timeEnd('id');

  for (let i = 1; i < tempIds.length - 2; i++) {
    if (tempIds[i] >= tempIds[i + 1]) {
      // 验证不通过，必须升序
      return false;
    }
  }
  return true;
}

// Number.MAX_SAFE_INTEGER
const test1 = idWorker.nextId();
const test2 = idWorker.nextId();

console.log(test1);
console.log(test2);

// https://jestjs.io/docs/en/expect#tobevalue
// https://doc.ebichu.cc/jest/docs/zh-Hans/using-matchers.html
describe('snowflakeId', () => {
  test('test1', () => {
    // expect(test1 < test2).toBeLessThan(test2);
    const result = test1 < test2;
    expect(result).toBeTruthy();
  });
  test('test2', () => {
    // expect(test1 < test2).toBeLessThan(test2);
    const result = checkOrderAsc();
    expect(result).toBeTruthy();
  });
});
