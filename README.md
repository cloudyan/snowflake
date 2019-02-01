# snowflake

分布式id生成算法的有很多种，Twitter的雪花算法（SnowFlake）就是其中经典的一种。

SnowFlake可以保证：

- 所有生成的id按时间趋势递增
- 整个分布式系统内不会产生重复id（因为有`datacenterId`和`workerId`来做区分）

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

反推机器ID、数据中心ID和创建的时间戳

- 机器ID = id >> workerIdShift & ~(-1n << workerIdBits);
- 数据中心ID = id >> datacenterIdShift & ~(-1n << datacenterIdBits);

参考：

雪花算法以及 BigInt

- [Twitter官方原版](https://github.com/twitter/snowflake/blob/snowflake-2010/src/main/scala/com/twitter/service/snowflake/IdWorker.scala) 用Scala写的
- [Twitter的雪花算法（snowflake）自增ID](https://blog.csdn.net/xiaopeng9275/article/details/72123709)
- [理解分布式id生成算法SnowFlake](https://segmentfault.com/a/1190000011282426)
- [BigInt：JavaScript 中的任意精度整数](https://zhuanlan.zhihu.com/p/36330307)

jest

- https://jestjs.io/docs/en/expect#tobevalue
- https://doc.ebichu.cc/jest/docs/zh-Hans/using-matchers.html
