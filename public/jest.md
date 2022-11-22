## Expect

#### `expect(value)`

每次要测试值时都会使用 `expect`函数。 您很少会单独调用 `expect` 。 相反，您将使用 `expect` 和“匹配器”函数来断言某个值。

举个例子更容易理解。 假设您有一个方法 `bestLaCroixFlavor()`，它应该返回字符串`'grapefruit'`。 以下是您测试的方法：

```javascript
test('the best flavor is grapefruit', () => {
  expect(bestLaCroixFlavor()).toBe('grapefruit');
});
```

在这种情况下， `toBe` 是匹配器函数。 有许多不同的匹配器功能，记录如下，以帮助您测试不同的东西。

期望的参数应该是你的代码产生的值，匹配器的任何参数都应该是正确的值。 如果你把它们混在一起，你的测试仍然可以工作，但失败测试的错误消息看起来很奇怪。



#### `expect.extend(matchers)`

您可以使用 `expect.extend` 将您自己的匹配器添加到 Jest。 例如，假设您正在测试一个数字实用程序库，并且您经常断言数字出现在其他数字的特定范围内。 您可以将其抽象为 `toBeWithinRange` 匹配器：

```javascript
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

test('numeric ranges', () => {
  expect(100).toBeWithinRange(90, 110);
  expect(101).not.toBeWithinRange(0, 100);
  expect({apples: 6, bananas: 3}).toEqual({
    apples: expect.toBeWithinRange(1, 10),
    bananas: expect.not.toBeWithinRange(11, 20),
  });
});
```

注意：在 TypeScript 中，例如使用 `@types/jest` 时，您可以像这样在导入的模块中声明新的 `toBeWithinRange` 匹配器：

```typescript
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(a: number, b: number): R;
    }
  }
}
```

**异步匹配器**

`expect.extend` 还支持异步匹配器。 异步匹配器返回一个 Promise，因此您需要等待返回的值。 让我们使用一个示例匹配器来说明它们的用法。 我们将实现一个名为 `toBeDivisibleByExternalValue` 的匹配器，其中的可整除数将从外部源中提取。

```javascript
expect.extend({
  async toBeDivisibleByExternalValue(received) {
    const externalValue = await getExternalValueFromRemoteSource();
    const pass = received % externalValue == 0;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be divisible by ${externalValue}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be divisible by ${externalValue}`,
        pass: false,
      };
    }
  },
});

test('is divisible by external value', async () => {
  await expect(100).toBeDivisibleByExternalValue();
  await expect(101).not.toBeDivisibleByExternalValue();
});
```

**自定义匹配器 API**

匹配器应该返回一个带有两个键的对象（或一个对象的 Promise）。 `pass` 指示是否存在匹配，并且 `message` 提供了一个没有参数的函数，如果失败则返回错误消息。 因此，当 `pass` 为 false 时， `message` 应该返回 `expect(x).yourMatcher()` 失败时的错误消息。 当 `pass` 为 true 时， `message` 应该返回 `expect(x).not.yourMatcher()` 失败时的错误消息。

匹配器使用传递给 `expect(x)` 的参数和传递给 `.yourMatcher(y, z)` 的参数调用：

```javascript
expect.extend({
  yourMatcher(x, y, z) {
    return {
      pass: true,
      message: () => '',
    };
  },
});
```

这些辅助函数和属性可以在自定义匹配器中的 `this`上找到：

**`this.isNot`**

一个布尔值，让您知道此匹配器是使用否定的 `.not` 修饰符调用的，允许您显示清晰正确的匹配器提示（请参阅示例代码）。

**`this.promise`**

一个字符串，允许您显示清晰正确的匹配器提示：

- `'rejects'` 如果使用 `promise .rejects` 修饰符调用匹配器
- `'resolves'` 如果使用 `promise .resolves` 修饰符调用匹配器
- `''` 如果没有使用承诺修饰符调用匹配器

**`this.equals(a, b)`**

这是一个深度相等函数，如果两个对象具有相同的值（递归地），它将返回 `true`。



#### `expect.anything()`

`expect.anything()` 匹配除 `null` 或 `undefined` 之外的任何内容。 您可以在 `toEqual` 或 `toBeCalledWith` 中使用它而不是文字值。 例如，如果要检查是否使用非空参数调用了模拟函数：

```javascript
function randocall(fn) {
  return fn(Math.floor(Math.random() * 6 + 1));
}

test('randocall calls its callback with a number', () => {
  const mock = jest.fn();
  randocall(mock);
  expect(mock).toBeCalledWith(expect.any(Number));
});
```



#### `expect.arrayContaining(array)`

`expect.arrayContaining(array)` 匹配接收到的数组，该数组包含预期数组中的所有元素。 也就是说，预期数组是接收数组的子集。 因此，它匹配包含不在预期数组中的元素的接收数组。

您可以使用它代替文字值：

- 在 `toEqual` 或 `toBeCalledWith` 中
- 匹配 `objectContaining` 或 `toMatchObject` 中的属性

```javascript
describe('arrayContaining', () => {
  const expected = ['Alice', 'Bob'];
  it('matches even if received contains additional elements', () => {
    expect(['Alice', 'Bob', 'Eve']).toEqual(expect.arrayContaining(expected));
  });
  it('does not match if received does not contain expected elements', () => {
    expect(['Bob', 'Eve']).not.toEqual(expect.arrayContaining(expected));
  });
});
```

```javascript
describe('Beware of a misunderstanding! A sequence of dice rolls', () => {
  const expected = [1, 2, 3, 4, 5, 6];
  it('matches even with an unexpected number 7', () => {
    expect([4, 1, 6, 7, 3, 5, 2, 5, 4, 6]).toEqual(
      expect.arrayContaining(expected),
    );
  });
  it('does not match without an expected number 2', () => {
    expect([4, 1, 6, 7, 3, 5, 7, 5, 4, 6]).not.toEqual(
      expect.arrayContaining(expected),
    );
  });
});
```



#### `expect.assertions(number)`

`expect.assertions(number)` 验证在测试期间调用了一定数量的断言。 这在测试异步代码时通常很有用，以确保回调中的断言确实被调用。

例如，假设我们有一个函数 `doAsync`，它接收两个回调 `callback1` 和 `callback2`，它将以未知的顺序异步调用它们。 我们可以用以下方法测试：

```javascript
test('doAsync calls both callbacks', () => {
  expect.assertions(2);
  function callback1(data) {
    expect(data).toBeTruthy();
  }
  function callback2(data) {
    expect(data).toBeTruthy();
  }

  doAsync(callback1, callback2);
});
```

`expect.assertions(2)` 调用确保两个回调都被实际调用。



#### `expect.hasAssertions()`

`expect.hasAssertions()` 验证在测试期间至少调用了一个断言。 这在测试异步代码时通常很有用，以确保回调中的断言确实被调用。

例如，假设我们有几个函数都处理状态。 `prepareState` 调用带有状态对象的回调，`validateState` 在该状态对象上运行，`waitOnState` 返回一个承诺，等待所有 `prepareState` 回调完成。 我们可以用以下方法测试：

```javascript
test('prepareState prepares a valid state', () => {
  expect.hasAssertions();
  prepareState(state => {
    expect(validateState(state)).toBeTruthy();
  });
  return waitOnState();
});
```

`expect.hasAssertions()` 调用可确保实际调用 `prepareState` 回调。



#### `expect.not.arrayContaining(array)`

`expect.not.arrayContaining(array)` 匹配接收到的不包含预期数组中所有元素的数组。 也就是说，预期数组不是接收数组的子集。

它是`expect.arrayContaining` 的反函数。

```javascript
describe('not.arrayContaining', () => {
  const expected = ['Samantha'];

  it('matches if the actual array does not contain the expected elements', () => {
    expect(['Alice', 'Bob', 'Eve']).toEqual(
      expect.not.arrayContaining(expected),
    );
  });
});
```



#### `expect.not.objectContaining(object)`

`expect.not.objectContaining(object)` 匹配任何不递归匹配预期属性的接收对象。 也就是说，预期对象不是接收对象的子集。 因此，它匹配包含不在预期对象中的属性的接收对象。

它是 `expect.objectContaining` 的反函数。

```javascript
describe('not.objectContaining', () => {
  const expected = {foo: 'bar'};

  it('matches if the actual object does not contain expected key: value pairs', () => {
    expect({bar: 'baz'}).toEqual(expect.not.objectContaining(expected));
  });
});
```

