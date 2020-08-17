/**
 * @file 测试入口文件
 * @author LeuisKen <leuisken@gmail.com>
 */

/* global san SanFactory */

describe('main', function () {

    it('env check', function () {
        expect(san.version).toBe('3.5.9');
        expect(require('san').version).toBe('3.5.4');
    });

    it('is a function', function () {
        expect(typeof SanFactory).toBe('function');
    });
});

describe('createInsance', function () {
    it('by data option', function () {
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
        expect(instance.el.innerHTML).toBe('Hello San');

        instance.dispose();
    });

    it('by el reverse', function (done) {
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
                el: document.getElementById('by-el-reverse')
            }
        });

        expect(instance.el.innerHTML).toContain('Hello San');

        instance.data.set('name', 'ER');
        instance.nextTick(function () {
            expect(instance.el.innerHTML).toContain('Hello ER');
            instance.dispose();
            done();
        });
    });

    it('setter and property inject', function () {
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

        function doAdd(a, b) {
            return this.add(a, b);
        }

        var instance = factory.createInstance({
            component: 'test',
            options: {
                data: {
                    name: 'San'
                }
            },
            properties: {
                adder: function (a, b) {
                    return a + b + 10;
                },

                max: function (a, b) {
                    return Math.max(a, b);
                }
            }
        });

        instance.attach(document.body);
        expect(doAdd.call(instance, 5, 10)).toBe(25);
        expect(instance.max(5, 10)).toBe(10);

        instance.dispose();
    });

    it('should support child component with key', function () {
        var factory = new SanFactory({
            san: san,
            components: {
                test: {
                    template: '<div><x-child name="{{name}}"/></div>',
                    components: {
                        'x-child': 'child'
                    }
                },

                child: {
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
        expect(instance.el.getElementsByTagName('h4')[0].innerHTML).toBe('Hello San');
        instance.dispose();
    });

    it('should support add component', function () {
        var factory = new SanFactory({
            san: san,
            components: {
                test: {
                    template: '<div><x-child name="{{name}}"/></div>',
                    components: {
                        'x-child': 'child'
                    }
                }
            }
        });

        factory.addComponent('child', {
            template: '<div><x-child name="{{name}}"/></div>',
            components: {
                'x-child': 'hello'
            }
        });

        factory.addComponents({
            hello: {
                template: '<h4>Hello {{name}}</h4>'
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
        expect(instance.el.getElementsByTagName('h4')[0].innerHTML).toBe('Hello San');
        instance.dispose();
    });

    it('should support child component with plain object', function () {
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

        var instance = factory.createInstance({
            component: 'test',
            options: {
                data: {
                    name: 'San'
                }
            }
        });
        instance.attach(document.body);
        expect(instance.el.getElementsByTagName('h4')[0].innerHTML).toBe('Hello San');
        instance.dispose();
    });

    it('should support child component with san component class', function () {
        var factory = new SanFactory({
            san: san,
            components: {
                test: {
                    template: '<div><x-child name="{{name}}"/></div>',
                    components: {
                        'x-child': san.defineComponent({
                            template: '<h4>Hello {{name}}</h4>'
                        })
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
            }
        });
        instance.attach(document.body);
        expect(instance.el.getElementsByTagName('h4')[0].innerHTML).toBe('Hello San');
        instance.dispose();
    });

    it('should support "self" component', function () {
        var factory = new SanFactory({
            san: san,
            components: {
                test: {
                    template: '<div>'
                        + '<h4 s-if="done">Hello {{name}}</h4>'
                        + '<x-child s-else name="{{name}}" done/>'
                        + '</div>',
                    components: {
                        'x-child': 'self'
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
            }
        });
        instance.attach(document.body);
        expect(instance.el.getElementsByTagName('h4')[0].innerHTML).toBe('Hello San');
        instance.dispose();
    });

    it('should support circular reference component', function () {
        var factory = new SanFactory({
            san: san,
            components: {
                test: {
                    template: '<div>'
                        + '<h4>Test {{name}}</h4>'
                        + '<x-child s-if="name" name="{{name}}" />'
                        + '</div>',
                    components: {
                        'x-child': 'child'
                    }
                },

                child: {
                    template: '<div>'
                        + '<h4>Child {{name}}</h4>'
                        + '<x-test></x-test>'
                        + '</div>',
                    components: {
                        'x-text': 'test'
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
            }
        });
        instance.attach(document.body);
        expect([].slice.call(instance.el.getElementsByTagName('h4')).map(el => el.innerHTML).join(','))
            .toBe('Test San,Child San');
        instance.dispose();
    });
});
