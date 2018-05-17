/**
 * san-factory
 * Copyright 2018 Baidu Inc. All rights reserved.
 *
 * @file san 组件工厂
 * @author errorrik
 */

(function () {
    /**
     * 组件工厂类
     *
     * @class
     * @param {Object} factoryConfig 工厂配置对象
     * @param {Object} factoryConfig.san san环境
     * @param {Array.<Object>} factoryConfig.components 组件prototype对象集合
     */
    function SanFactory(factoryConfig) {
        this.config = factoryConfig || {};
        this.ComponentClasses = {};
    }

    /**
     * 创建组件实例
     *
     * @param {Object} instanceConfig 实例创建的配置对象
     * @param {Object?} instanceConfig.options 实例创建时的参数
     * @param {Object?} instanceConfig.options.data 实例创建的初始化数据
     * @param {HTMLElement?} instanceConfig.options.el 实例创建时的主元素，组件反解时用
     * @param {Object?} instanceConfig.properties 注入实例属性的对象
     * @return {san.Component}
     */
    SanFactory.prototype.createInstance = function (instanceConfig) {
        if (!instanceConfig) {
            return;
        }

        var component = instanceConfig.component;
        var ComponentClass = component ? this.getComponentClass(component) : null;
        if (!ComponentClass) {
            return;
        }

        var instance = new ComponentClass(instanceConfig.options);

        // 属性注入：set 或直接注入对象属性
        for (var key in instanceConfig.properties) {
            if (instanceConfig.properties.hasOwnProperty(key)) {
                var method = 'set' + key.slice(0, 1).toUpperCase() + key.slice(1);
                var property = instanceConfig.properties[key];

                if (typeof instance[method] === 'function') {
                    instance[method](instanceConfig.properties[key]);
                }
                else {
                    instance[key] = property;
                }
            }
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
        var san = this.config.san;
        var components = this.config.components;

        if (san && components) {
            var ComponentClass = this.ComponentClasses[name];
            if (!ComponentClass) {

                var realComponentClassProto = {};
                var componentClassProto = components[name];

                // 新构造组件类的 prototype，不要在原来的上改
                for (var key in componentClassProto) {
                    if (componentClassProto.hasOwnProperty(key)) {

                        var protoItem = componentClassProto[key];

                        // 处理 components 中的 string
                        // 构造并替换为实际的组件类
                        if (key === 'components') {
                            var realComponents = {};
                            realComponentClassProto[key].components = realComponents;

                            for (var cmptKey in protoItem) {
                                var cmptItem = protoItem[cmptKey];

                                // self 或者 组件的构造器时，不用重新 getComponentClass
                                realComponents[cmptKey] = cmptItem === 'self' || typeof cmptItem === 'function'
                                    ? cmptItem
                                    : this.getComponentClass(cmptItem);
                            }
                        }
                        else {
                            realComponentClassProto[key] = protoItem;
                        }

                    }
                }

                ComponentClass = san.defineComponent(realComponentClassProto);
            }

            return ComponentClass;
        }
    };

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