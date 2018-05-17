/**
 * san-factory
 * Copyright 2018 Baidu Inc. All rights reserved.
 *
 * @file san 组件工厂
 * @author errorrik
 */

(function (root) {

    /**
     * 组件工厂类
     *
     * @class
     * @param {Object} factoryConfig 工厂配置对象
     * @param {Object} factoryConfig.san san环境
     * @param {Object} factoryConfig.components 组件prototype对象集合
     */
    function SanFactory(factoryConfig) {
        factoryConfig = factoryConfig || {};

        // #[begin] error
        if (typeof name !== 'string') {
            throw new Error('[SAN-FACTORY ERROR] name must be a string.');
        }
        // #[end]

        // #[begin] error
        if (typeof factoryConfig.san.defineComponent !== 'function') {
            throw new Error('[SAN-FACTORY ERROR] please check the san runtime that you provided.');
        }
        // #[end]

        this.san = factoryConfig.san;
        this.components = factoryConfig.components || {};
    }

    /**
     * 创建组件实例
     *
     * @param {Object} instanceConfig 实例创建的配置对象
     * @param {string} instanceConfig.name 组件类名称，与factoryConfig.components的key对应
     * @param {Object?} instanceConfig.properties 注入实例属性的对象
     * @param {Object?} instanceConfig.options 实例创建时的参数
     * @param {Object?} instanceConfig.options.data 实例创建的初始化数据
     * @param {HTMLElement?} instanceConfig.options.el 实例创建时的主元素，组件反解时用
     * @return {san.Component}
     */
    SanFactory.prototype.createInstance = function (instanceConfig) {
        instanceConfig = instanceConfig || {};
        var name = instanceConfig.name;

        // #[begin] error
        if (typeof name !== 'string') {
            throw new Error('[SAN-FACTORY ERROR] instanceConfig.name must be a string.');
        }
        // #[end]

        var ComponentClass = this.getComponentClass(name);
        var options = instanceConfig.options || {};
        var instance = new ComponentClass(options);

        var properties = instanceConfig.properties;
        if (properties) {
            return extend(instance, properties);
        }

        return instance;
    };

    /**
     * 获取组件类
     *
     * @param {string} name 组件类名称，与factoryConfig.components的key对应
     * @return {Function}
     */
    SanFactory.prototype.getComponentClass = function (name) {

        // #[begin] error
        if (typeof name !== 'string') {
            throw new Error('[SAN-FACTORY ERROR] name must be a string.');
        }
        // #[end]

        var proto = this.components[name];

        // #[begin] error
        if (proto == null) {
            throw new Error('[SAN-FACTORY ERROR] can not find component prototype by name: ' + name + '.');
        }
        // #[end]

        return wrapper(this.san, proto, this.components);

    };

    /**
     * 将组件类的prototype对象包装成san的组件类
     *
     * @param {Object} san san环境
     * @param {Object} proto 待包装的组件类prototype对象
     * @param {Object} components 全局的组件prototype对象集合
     * @return {Function} 组件类
     */
    function wrapper(san, proto, components) {
        if (typeof proto === 'function') {
            return proto;
        }

        var subComponents = proto.components;

        // 如果原型实现不依赖其他子组件，直接使用原型创建san组件类
        if (subComponents == null) {
            return san.defineComponent(proto);
        }

        // 否则，递归子组件原型
        for (var name in subComponents) {
            if (subComponents.hasOwnProperty(name)) {
                // 这里的target可以是字符串或者对象
                var target = subComponents[name];
                // 如为字符串，则去全局的组件prototype对象集合里找对应的原型
                if (typeof target === 'string' && components[target]) {
                    subComponents[name] = wrapper(san, components[target], components);
                    components[target] = subComponents[name];
                }
                // 其他情况，仅认为值为对象，将target视为原型传入即可
                subComponents[name] = wrapper(san, target, components);
            }
        }

        return san.defineComponent(proto);
    }

    /**
     * 对象属性拷贝
     *
     * @param {Object} target 目标对象
     * @param {Object} source 源对象
     * @return {Object} 返回目标对象
     */
    function extend(target, source) {
        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                var value = source[key];
                if (typeof value !== 'undefined') {
                    target[key] = value;
                }
            }
        }

        return target;
    }

    // export
    if (typeof exports === 'object' && typeof module === 'object') {
        // For CommonJS
        exports = module.exports = SanFactory;
    }
    else if (typeof define === 'function' && define.amd) {
        // For AMD
        define('san-factory', [], SanFactory);
    }
    else {
        // For <script src="..."
        root.SanFactory = SanFactory;
    }
})(this);
