/**
 * san-factory
 * Copyright 2018 Baidu Inc. All rights reserved.
 *
 * @file san 组件工厂
 * @author errorrik <errorrik@gmail.com>
 *         LeuisKen(leuisken@gmail.com)
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
        this.config = factoryConfig || {};
        // 用于缓存生成好的构造类的对象
        this.ComponentClasses = {};

        // 用于缓存已处理的组件 components
        this.componentsCache = {};
    }

    SanFactory.version = '1.0.0';

    /**
     * 创建组件实例
     *
     * @param {Object} instanceConfig 实例创建的配置对象
     * @param {string} instanceConfig.component 组件类名称，与factoryConfig.components的key对应
     * @param {Object?} instanceConfig.properties 注入实例属性的对象
     * @param {Object?} instanceConfig.options 实例创建时的参数
     * @param {Object?} instanceConfig.options.data 实例创建的初始化数据
     * @param {HTMLElement?} instanceConfig.options.el 实例创建时的主元素，组件反解时用
     * @return {san.Component}
     */
    SanFactory.prototype.createInstance = function (instanceConfig) {
        if (typeof instanceConfig !== 'object') {
            return;
        }

        var component = instanceConfig.component;
        var ComponentClass = component && this.getComponentClass(component);

        if (!ComponentClass) {
            return;
        }

        var instance = new ComponentClass(instanceConfig.options);
        var properties = instanceConfig.properties;

        for (var key in properties) {
            if (properties.hasOwnProperty(key)) {
                var method = 'set' + key.slice(0, 1).toUpperCase() + key.slice(1);
                var property = properties[key];

                if (typeof instance[method] === 'function') {
                    instance[method](properties[key]);
                }
                else {
                    instance[key] = property;
                }
            }
        }

        return instance;
    };

    /**
     * 根据name（key值）获取组件类
     *
     * @param {string} name 组件类名称，与factoryConfig.components的key对应
     * @return {Function}
     */
    SanFactory.prototype.getComponentClass = function (name) {
        if (!isEnvValid(this.config)) {
            return;
        }

        var ComponentClasses = this.ComponentClasses;

        // 如果有缓存
        if (ComponentClasses[name]) {
            return ComponentClasses[name];
        }

        var componentClassProto = this.config.components[name];
        var realComponentClass = this.defineComponent(componentClassProto, name);
        ComponentClasses[name] = realComponentClass;
        return realComponentClass;
    };

    /**
     * 将组件类的prototype对象包装成san的组件类
     *
     * @param {Object} componentClassProto 待包装的组件类prototype对象
     * @param {string} name 组件类名称，与factoryConfig.components的key对应
     * @return {Function} 组件类
     */
    SanFactory.prototype.defineComponent = function (componentClassProto, name) {
        if (!isEnvValid(this.config)) {
            return;
        }

        var realComponentClassProto = {};
        for (var key in componentClassProto) {
            if (componentClassProto.hasOwnProperty(key)) {
                var protoItem = componentClassProto[key];

                if (key !== 'components') {
                    realComponentClassProto[key] = protoItem;
                }
                // 处理 components 中的 string
                // 构造并替换为实际的组件类
                else {
                    var realComponents = {};
                    realComponentClassProto.components = realComponents;

                    // 如果已经处理过
                    if (name && this.componentsCache[name]) {
                        continue;
                    }

                    this.componentsCache[name] = realComponents;

                    for (var cmptKey in protoItem) {
                        var cmptItem = protoItem[cmptKey];
                        // self 或者 组件的构造器时，不用重新 getComponentClass
                        if (cmptItem === 'self' || typeof cmptItem === 'function') {
                            realComponents[cmptKey] = cmptItem;
                        }
                        // 非 self 的字符串，直接调用 getComponentClass
                        else if (typeof cmptItem === 'string') {
                            realComponents[cmptKey] = this.getComponentClass(cmptItem);
                        }
                        // 其他情况（proto对象），则调用wrapper包装
                        else {
                            realComponents[cmptKey] = this.defineComponent(cmptItem);
                        }
                    }
                }
            }
        }
        return this.config.san.defineComponent(realComponentClassProto);
    };

    /**
     * 动态增加组件对象
     *
     * @param {string} name 组件名称
     * @param {Object} component 组件prototype对象
     */
    SanFactory.prototype.addComponent = function (name, component) {
        if (!isEnvValid(this.config)) {
            return;
        }

        // 如果组件名称已经存在则忽略
        if (!this.config.components[name]) {
            this.config.components[name] = component;
        }
    };

    /**
     * 动态增加组件对象集合
     *
     * @param components 需要增加的组件prototype对象集合
     */
    SanFactory.prototype.addComponents = function (components) {
        for (var name in components) {
            if (components.hasOwnProperty(name)) {
                this.addComponent(name, components[name]);
            }
        }
    };

    /**
     * 检测config对象是否符合预期
     *
     * @param {Object} config 工厂类config对象
     * @return {boolean} 是否符合预期
     */
    function isEnvValid(config) {
        return config.san && config.components;
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
