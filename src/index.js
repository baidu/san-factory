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
        this.config.components = this.config.components || {};

        // 已定义完成的组件类
        this.ComponentClasses = {};
    }

    SanFactory.version = '1.1.1';

    /**
     * 创建组件实例
     *
     * @param {Object} instanceConfig 实例创建的配置对象
     * @param {string|Object} instanceConfig.component 当为string时，组件类名称，与factoryConfig.components的key对应
     *                        当为Object时，组件原型对象，会创建匿名组件实例，组件类不会注册在factory中
     * @param {Object?} instanceConfig.properties 注入实例属性的对象
     * @param {Object?} instanceConfig.options 实例创建时的参数
     * @param {Object?} instanceConfig.options.data 实例创建的初始化数据
     * @param {HTMLElement?} instanceConfig.options.el 实例创建时的主元素，组件反解时用
     * @return {san.Component}
     */
    SanFactory.prototype.createInstance = function (instanceConfig) {
        if (typeof instanceConfig !== 'object' || !instanceConfig.component) {
            return;
        }

        var component = instanceConfig.component;

        var ComponentClass;
        switch (typeof component) {
            case 'string':
                ComponentClass = this.getComponentClass(component);
                break;

            case 'object':
                ComponentClass = defineComponent(this, component);
        }

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
        if (name && this.ComponentClasses[name]) {
            return this.ComponentClasses[name];
        }

        return defineComponent(this, this.config.components[name], name);
    };

    /**
     * 获取所有组件类
     *
     * @return {Object} 组件类集合
     */
    SanFactory.prototype._getAllComponentClasses = function () {
        var componentClasses = {};

        for (var name in this.config.components) {
            componentClasses[name] = this.getComponentClass(name);
        }

        return componentClasses;
    };

    /**
     * 动态增加组件对象
     *
     * @param {string} name 组件名称
     * @param {Object} component 组件prototype对象
     */
    SanFactory.prototype.addComponent = function (name, component) {
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

    function Empty() {
    }

    /**
     * 将组件类的prototype对象包装成san的组件类
     *
     * @inner
     * @param {SanFactory} factory 工厂实例
     * @param {Object} proto 待包装的组件类prototype对象
     * @param {string=} name 组件名称
     * @return {Function} 组件类
     */
    function defineComponent(factory, proto, name) {
        if (!factory.config.san || !proto) {
            return;
        }

        var SanComponent = factory.config.san.Component;
        Empty.prototype = SanComponent.prototype;
        var realProto = new Empty();
        realProto._cmptReady = true;
        realProto.components = {};

        var ComponentClass = function (option) {
            SanComponent.call(this, option);
        };
        ComponentClass.prototype = realProto;
        realProto.constructor = ComponentClass;
        if (name) {
            factory.ComponentClasses[name] = ComponentClass;
        }

        var subComponents;

        for (var key in proto) {
            if (proto.hasOwnProperty(key)) {
                if (key === 'components') {
                    subComponents = proto[key];
                }
                else {
                    realProto[key] = proto[key];
                }
            }
        }


        for (var cmptKey in subComponents) {
            var cmptItem = subComponents[cmptKey];

            switch (typeof cmptItem) {
                // self 或者 组件的构造器时，不用重新 getComponentClass
                case 'string':
                    realProto.components[cmptKey] = cmptItem === 'self'
                        ? ComponentClass
                        : factory.getComponentClass(cmptItem);
                    break;

                case 'function':
                    realProto.components[cmptKey] = cmptItem;
                    break;

                // 其他情况（proto对象），则调用wrapper包装
                default:
                    realProto.components[cmptKey] = defineComponent(factory, cmptItem);
            }
        }

        return ComponentClass;
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
