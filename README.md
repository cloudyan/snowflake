# snowflake

分布式id生成算法的有很多种，Twitter的雪花算法（SnowFlake）就是其中经典的一种。

SnowFlake可以保证：

- 所有生成的id按时间趋势递增
- 整个分布式系统内不会产生重复id（因为有`datacenterId`和`workerId`来做区分）

问题？

- workid 怎么保证唯一？
  - 可以通过分布式缓存来保存机器ID和workid之间的映射关系。启动的时候访问分布式缓存查询当前机器ID对应的workid，如果查询不到则获取一个并保存到分布式缓存中。
- lastTimestamp上次生成ID的时间戳，这个是在内存中，系统时钟回退+重启后呢？无法保证
  - 目前好像只能流程上控制系统时钟不回退。
- 41位 `(timestamp - this.twepoch) << this.timestampLeftShift` 超过长整型怎么办？
  - this.twepoch 可以设置当前开始使用系统时的时间，可以保证69年不超
- Javascript 无法支持> 53位的数字怎么办？
  - js `Number`被表示为双精度浮点数，最大值为 `Number.MAX_SAFE_INTEGER` = `2^53-1`
  - `BigInt` 是 JavaScript 中的一个新的原始数字类型，可以用任意精度表示整数。即使超出 `Number` 的安全整数范围限制，也可以安全地存储和操作大整数。
  - 要创建一个 `BigInt`，将 `n` 作为后缀添加到任何整数文字字面量
- `BigInt` 支持大数，那怎么控制这里用 64bits 长整型，左移溢出会出现问题吗？
  - 这里不做处理会出现问题，`BigInt` 可以用任意精度表示整数
  - 如何处理？**暂不处理**
    - 此问题本质还是上面的41位时间差问题，**69年不超，再长就超了**，需要重新设计支持，也可以做溢出提示。
    - 如果想限制为仅64位整数，则必须始终使用强制转换 `BigInt.asIntN` `BigInt.asUintN`
    - 只要我们传递 `BigInt` 超过 64 位整数范围的值（例如，63 位数值 + 1 位符号位），就会发生溢出。

## 概述

SnowFlake算法生成id的结果是一个64bit大小的整数，它的结构如下图：

![SnowFlake](./docs/1.jpeg)

- `1位`，不用。二进制中最高位为1的都是负数，但是我们生成的id一般都使用整数，所以这个最高位固定是0
- `41位`，用来记录时间戳（毫秒）。
  - `41位`可以表示`$2^{41}-1$`个数字，
  - 如果只用来表示正整数（计算机中正数包含0），可以表示的数值范围是：0 至 `$2^{41}-1$`，减1是因为可表示的数值范围是从0开始算的，而不是1。
  - 也就是说41位可以表示`$2^{41}-1$`个毫秒的值，转化成单位年则是`$(2^{41}-1) / (1000 * 60 * 60 * 24 * 365) = 69$`年
- `10位`，用来记录工作机器id。
  - 可以部署在`$2^{10} = 1024$`个节点，包括`5位datacenterId`和`5位workerId`
  - `5位（bit）`可以表示的最大正整数是`$2^{5}-1 = 31$`，即可以用0、1、2、3、....31这32个数字，来表示不同的`datecenterId`或`workerId`
- `12位`，序列号，用来记录同毫秒内产生的不同id。
  - `12位（bit）`可以表示的最大正整数是`$2^{12}-1 = 4095$`，即可以用0、1、2、3、....4094这4095个数字，来表示同一机器同一时间截（毫秒)内产生的4095个ID序号

由于64bit的整数是long类型，所以SnowFlake算法生成的id就是long来存储的。但这个长度超出 js 最大数范围 `Number.MAX_SAFE_INTEGER` 了，在js 中实现要使用 BigInt 来表示。

## Talk is cheap, show you the code

[JS 版本](./src/snowflake.js)

## 代码理解

https://segmentfault.com/a/1190000011282426

### 位运算基础

- 在计算机中，负数的二进制是用补码来表示的。
  - 反码 = 除符号位, 原码其余位取反而得
  - 补码 = 反码 + 1
  - 补码 = （原码 - 1）再取反码
- 在计算机中无符号数用原码表示, 有符号数用补码表示
  <!-- - w位补码表示的值为(MathJax) `-x_{w-1}2^{w-1}+{\sum_{i=1}^{w-2}x_{i}2^{i}}` -->

补码的意义就是可以拿补码和原码（3的二进制）相加，最终加出一个“溢出的0”

因此-1的二进制应该这样算：

```code
00000000 00000000 00000000 00000001 //原码：1的二进制
11111111 11111111 11111111 11111110 //取反码：1的二进制的反码
11111111 11111111 11111111 11111111 //加1：-1的二进制表示（补码）
```

### 用位运算计算n个bit能表示的最大数值

```js
const maxWorkerId = -1n ^ (-1n << 5n)

// 利用位运算计算出5位能表示的最大正整数是多少
```

-1 左移 5，得结果a ：

```code
        11111111 11111111 11111111 11111111 // -1的二进制表示（补码）
  11111 11111111 11111111 11111111 11100000 // 高位溢出的不要，低位补0
        11111111 11111111 11111111 11100000 // 结果a
```

-1 异或 a ：

```code
        11111111 11111111 11111111 11111111 // -1的二进制表示（补码）
    ^   11111111 11111111 11111111 11100000 // 两个操作数的位中，相同则为0，不同则为1
---------------------------------------------------------------------------
        00000000 00000000 00000000 00011111 // 最终结果31
```

最终结果是31，二进制 `00000000 00000000 00000000 00011111` 转十进制可以这么算：

```math
2^4 + 2^3 + 2^2 + 2^1 + 2^0 = 16 + 8 + 4 + 2 + 1 = 31
```

### 用mask防止溢出

```js
this.sequence = (this.sequence + 1n) & this.sequenceMask;

// 这段代码通过 `位与` 运算保证计算的结果范围始终是 0-4095
```

### 用位运算汇总结果

位或运算，同一位只要有一个是1，则结果为1，否则为0。

位运算左移超出的溢出部分扔掉，右侧空位则补0。

```code
return (
      ((timestamp - this.twepoch) << this.timestampLeftShift) | // 时间差左移22
      (this.dataCenterId << this.dataCenterIdShift) | // 数据标识id左移 17
      (this.workerId << this.workerIdShift) | // 机器id左移 12
      this.sequence
    );
--------------------
        |
        |简化
       \|/
--------------------
return (la) |
      (lb) |
      (lc) |
      sequence;

数据示例：

timestamp: 1505914988849
twepoch: 1288834974657
datacenterId: 17
workerId: 25
sequence: 0

二进制过程

  1 |                    41                        |  5  |   5  |     12

   0|0001100 10100010 10111110 10001001 01011100 00|     |      |              //la
   0|                                              |10001|      |              //lb
   0|                                              |     |1 1001|              //lc
or 0|                                              |     |      |‭0000 00000000‬ //sequence
------------------------------------------------------------------------------------------
   0|0001100 10100010 10111110 10001001 01011100 00|10001|1 1001|‭0000 00000000‬ //结果：910499571847892992
```

## 支持反推数据

反推机器ID、数据中心ID和创建的时间戳

- 机器ID = id >> workerIdShift & ~(-1n << workerIdBits);
- 数据中心ID = id >> datacenterIdShift & ~(-1n << datacenterIdBits);
- 时间戳 = id >> timestampLeftShift & ~(-1n << 41n) + twepoch;

参考：

雪花算法

- [Twitter官方原版](https://github.com/twitter/snowflake/blob/snowflake-2010/src/main/scala/com/twitter/service/snowflake/IdWorker.scala) 用Scala写的
- [Twitter ID（Snowflake）](https://developer.twitter.com/en/docs/basics/twitter-ids)
- [ID生成器，Twitter的雪花算法（Java）](https://blog.csdn.net/xiaopeng9275/article/details/72123709)
- [理解分布式id生成算法SnowFlake](https://segmentfault.com/a/1190000011282426)

BigInt

- [BigInt：JavaScript 中的任意精度整数](https://zhuanlan.zhihu.com/p/36330307)
- [BigInt: arbitrary-precision integers in JavaScript](https://developers.google.com/web/updates/2018/05/bigint)
  - [chrome jsbi](https://github.com/GoogleChromeLabs/jsbi#why)
  - [ES proposal: BigInt – arbitrary precision integers](http://2ality.com/2017/03/es-integer.html)
- [MDN BigInt 语法](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt)
- [tc39: proposal-bigint](https://github.com/tc39/proposal-bigint)
- [Javascript 提案 BigInt 的一些坑](https://zhuanlan.zhihu.com/p/36385254)

关于限制为仅64位整数，需要特定处理，可以提示数据长度溢出了。

```js
// 在 console 中测试，溢出怎么办，怎么检查出问题了
var aa = 1n;
(aa<<62n).toString(2).padStart(64, 0);
(aa<<65n).toString(2).padStart(64, 0);
(BigInt.asIntN(64, aa<<62n)).toString(2).padStart(64, 0);
(BigInt.asIntN(64, aa<<65n)).toString(2).padStart(64, 0);

const max = 2n ** (64n - 1n) - 1n;
BigInt.asIntN(64, max); // 有符号数
BigInt.asUintN(64, max); // 无符号数
→ 9223372036854775807n
BigInt.asIntN(64, max + 1n);

new BigInt64Array(4)
```

jest

- https://jestjs.io/docs/en/expect#tobevalue
- https://doc.ebichu.cc/jest/docs/zh-Hans/using-matchers.html
