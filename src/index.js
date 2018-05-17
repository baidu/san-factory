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
    }

    /**
     * 创建组件实例
     *
     * @param {Object} instanceConfig 实例创建的配置对象
     * @param {string} instanceConfig.component 组件类名称，与factoryConfig.components的key对应
     * @param {Object?} instanceConfig.options 实例创建时的参数
     * @param {Object?} instanceConfig.options.data 实例创建的初始化数据
     * @param {HTMLElement?} instanceConfig.options.el 实例创建时的主元素，组件反解时用
     * @param {Object?} instanceConfig.properties 注入实例属性的对象
     * @return {san.Component}
     */
    SanFactory.prototype.createInstance = function (instanceConfig) {
        
    };

    /**
     * 获取组件类
     *
     * @param {string} name 组件类名称，与factoryConfig.components的key对应
     * @return {Function}
     */
    SanFactory.prototype.getComponentClass = function (name) {
        
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