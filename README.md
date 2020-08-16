# san-factory

[![NPM version](http://img.shields.io/npm/v/san-factory.svg?style=flat-square)](https://npmjs.org/package/san-factory)
[![License](https://img.shields.io/github/license/baidu/san-factory.svg?style=flat-square)](https://npmjs.org/package/san-factory)

当我们在编写 [San](https://baidu.github.io/san/) 组件的时候，为了方便使用，通常会暴露给使用者组件的构造函数，即采用类似如下的方式编写：

使用`san.defineComponent`创建：

```js
var san = require('san');
var componentProto = {
    template: '<div>Hello {{name}}</div>'
};

module.exports = san.defineComponent(componentProto);
```

继承`san.Component`创建：

```js
import san from 'san';

export default class MyComponent extends san.Component {
    static template = '<div>Hello {{name}}</div>';
}
```

这样编写的组件有一些限制：

- 在组件的实现中，静态地依赖了`san`的实现，因此也就无法满足动态注入`san`实现的场景
- 如果组件内部实现依赖了其他的子组件，这个依赖也是静态的，没有办法动态地去替换子组件的实现。

san-factory 就是在这样的需求下诞生的。你可以从下面找到 san-factory 的下载和使用说明，也可以直接通过 [测试用例](./test/index.spec.js) 查看其是如何使用的。

下载
----

NPM:

```
$ npm i san-factory
```


使用
----

### Webpack + Babel

通过 import 导入

```js
import san from 'san';
import SanFactory from 'san-factory';

let factory = new SanFactory({
    san: san,
    components: {
        test: {
            template: '<h4>Hello {{name}}</h4>'
        }
    }
});

let instance = factory.createInstance({
    component: 'test',
    options: {
        data: {
            name: 'San'
        }
    }
});

instance.attach(document.body);
```

### AMD

通过 require 引入

```js
var san = require('san');
var SanFactory = require('san-factory');

var factory = new SanFactory({
    san: san,
    components: {
        test: {
            template: '<h4>Hello {{name}}</h4>'
        }
    }
});

var instance = factory.createInstance({
    component: 'test',
    options: {
        data: {
            name: 'San'
        }
    }
});

instance.attach(document.body);
```

请为 amd loader 正确配置 san-factory 的引用路径。通过 npm 安装的项目可以采用下面的配置

```js
require.config({
    baseUrl: 'src',
    paths: {
        'san-factory': '../dep/san-factory/dist/san-factory.source'
    }
});
```

开始使用
----

### 基本使用

san-factor 对外提供一个 `SanFactory` 的组件工厂类，这个类接收一个 `factoryConfig` 配置对象。该对象包含两个属性，`san`是你传入的 [San](https://baidu.github.io/san/) 框架实现，`components` 是你传入的组件 prototype 对象集合。

下面是一个基本的示例：

```js
var factory = new SanFactory({
    san: san,
    components: {
        test: {
            template: '<h4>Hello {{name}}</h4>'
        }
    }
});
```

你可以使用 `createInstance` 方法，来获取 test 组件的一个实例：

```js
var instance = factory.createInstance({
    // 这里的 test 和创建工厂类时，components 字段的 test 字段的组件原型对应
    component: 'test',
    // 这里的 options 和 new ComponentClass(option) 中的 option 对应
    // 关于 options 的更多细节还请参考 san 的官方文档
    // @see: https://baidu.github.io/san/doc/api/#%E5%88%9D%E5%A7%8B%E5%8C%96%E5%8F%82%E6%95%B0
    options: {
        data: {
            name: 'San'
        }
    }
});
```

将这个实例当做正常的 San 组件实例即可。组件实例的方法请参考 [San 的官方文档](https://baidu.github.io/san/doc/api/#%E7%BB%84%E4%BB%B6%E6%96%B9%E6%B3%95)。

```js
instance.attach(document.body);
```

当然，如果你想直接获取 test 组件的构造函数，可以通过 `getComponentClass` 直接获取。

```js
var ComponentClass = factory.getComponentClass('test');
var instance = new ComponentClass({
    data: {
        name: 'San'
    }
});
instance.attach(document.body);
```

### 定义子组件

在 San 里面，组件中通常通过声明自定义元素，使用其它组件，详见 [components文档](https://baidu.github.io/san/tutorial/component/#components)。下面是一个基本的例子：

```js
var Title = san.defineComponent({
    template: '<h4>{{text}}</h4>'
});

var Article = san.defineComponent({
    template: ''
        + '<div>'
        + '  <x-title text="{{title}}"/>'
        + '  <p>{{text}}</p>'
        + '</div>',
    // 在 san 中，要求 components 字段的值是组件的类
    components: {
        'x-title': Title
    }
});
```

在 san-factory 中，`components` 字段支持的类型更加灵活，除了组件类和之外，你可以使用组件原型对象和对应 `factoryConfig.components` 对象中配置key字符串来配置依赖，如下面的例子：

**使用组件原型对象**

```js
var factory = new SanFactory({
    san: san,
    components: {
        test: {
            template: '<div><x-child name="{{name}}"/></div>',
            components: {
                'x-child': {
                    template: '<h4>Hello {{name}}</h4>'
                }
            }
        }
    }
});
```

**使用 factoryConfig.components 对象的 key 值**

```js
var factory = new SanFactory({
    san: san,
    // factoryConfig.components 字段
    components: {
        // key 为 test 的组件原型对象，其 components 属性，包含了一个 'child' 值
        test: {
            template: '<div><x-child name="{{name}}"/></div>',
            components: {
                'x-child': 'child'
            }
        },
        // 根据上面的 'child' 值，映射到对应的组件原型
        child: {
            template: '<h4>Hello {{name}}</h4>'
        }
    }
});
```

这是一个非常强大的功能。他允许你在定义组件的时候，同一个父组件原型对象，其子组件只要key值和接口保持一致，可以通过key值进行任意组合。

比如我编写了一个`form`组件的原型，其依赖了`x-input: 'input'`子组件。我可以创建多个工厂类，其包含不同的`components.input`。这样在不修改`form`组件实现的情况下，只要保证各个`input`的接口表现一致，就能保证逻辑组件可以正常工作。

### 属性/接口注入

用于在实例构造完毕后需要依赖的场景。在组件配置中，通过 `properties` 配置来声明属性/接口依赖：

下面是一个例子：

```js
var factory = new SanFactory({
    san: san,
    components: {
        test: {
            template: '<h4>Hello {{name}}</h4>',
            setAdder: function (adder) {
                this.add = adder;
            }
        }
    }
});

var instance = factory.createInstance({
    component: 'test',
    options: {
        data: {
            name: 'San'
        }
    },
    properties: {
        // 当属性名
        adder: function (a, b) {
            return a + b + 10;
        },

        max: function (a, b) {
            return Math.max(a, b);
        }
    }
});

instance.add(5, 10);        // 25
instance.max(5, 10);        // 10
```

`createInstance`方法会根据声明创建对应的依赖，按照以下步骤将依赖注入给实例：

- 当定义`properties`字段时，`createInstance`方法将查找属性名称对应的setter方法(set${Name})，将依赖作为参数传入，返回。如上例中，`instanceConfig.properties.adder`作为参数传入了`factoryConfig.components.test.setAdder`，最终创建了`instance.add`方法。
- 若实例不存在属性setter，则直接通过赋值的方式将依赖注入给实例，即：instance.propertyName = propertyValue。如上例中，`instanceConfig.properties.max`方法，直接创建了`instance.max`方法。

API
----

### SanFactory

`描述`：SanFactory({Object}factoryConfig)

`说明`：

组件工厂类。

`参数`：

- `Object` factoryConfig.san - 传入san环境
- `Object` factoryConfig.components - 组件prototype对象集合

#### createInstance

`描述`：{san.Component} createInstance({Object}instanceConfig)

`说明`

根据`instanceConfig`创建一个组件实例。

`参数`

- `string` instanceConfig.component - 组件类名称，与factoryConfig.components的key对应
- `Object?` instanceConfig.properties - 注入实例属性的对象
- `Object?` instanceConfig.options - 实例创建时的参数，详见[San文档](https://baidu.github.io/san/doc/api/#%E5%88%9D%E5%A7%8B%E5%8C%96%E5%8F%82%E6%95%B0)

#### getComponentClass

`描述`：{Function} getComponentClass({string}name)

`说明`

根据name（key值）获取组件类

`参数`

- `string` name - 组件类名称，与factoryConfig.components的key对应


#### addComponents

`描述`：{Function} addComponents({Object}components)

`说明`

动态增加组件对象集合

`参数`

- `Object` components - 组件prototype对象集合


