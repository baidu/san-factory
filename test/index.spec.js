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

describe('createInstance', function () {
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

    it('by proto', function () {
        var factory = new SanFactory({
            san: san,
            components: {
                child: {
                    template: '<button>'
                        + '{{name}}'
                        + '</button>'
                }
            }
        });

        var instance = factory.createInstance({
            component: {
                template: '<div><x-child name="{{name}}"></x-child></div>',
                components: {
                    'x-child': 'child'
                }
            },
            options: {
                data: {
                    name: 'San'
                }
            }
        });

        instance.attach(document.body);
        var btn = instance.el.getElementsByTagName('button');
        expect(btn[0].innerHTML).toBe('San');

        instance.dispose();
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

    it('should support circular sub component', function () {
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
                        'x-test': 'test'
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

        var h4s = instance.el.getElementsByTagName('h4');
        expect(h4s[0].innerHTML).toBe('Test San');
        expect(h4s[1].innerHTML).toBe('Child San');

        var ClassTest = factory.getComponentClass('test');
        var ClassChild = factory.getComponentClass('child');
        expect(ClassTest.prototype.components['x-child'] === ClassChild).toBeTruthy();
        expect(ClassChild.prototype.components['x-test'] === ClassTest).toBeTruthy();

        instance.dispose();
    });

    it('should support complex circular sub component', function () {
        var factory = new SanFactory({
            san: san,
            components: {
                root: {
                    template: '<div>'
                        + '<x-main name="{{name}}" />'
                        + '</div>',
                    components: {
                        'x-main': 'main'
                    }
                },

                main: {
                    template: '<div>'
                        + '<h4>main {{name}}</h4>'
                        + '<x-child s-if="name" name="{{name}}" />'
                        + '</div>',
                    components: {
                        'x-child': 'child'
                    }
                },

                child: {
                    template: '<div>'
                        + '<h4>child {{name}}</h4>'
                        + '<x-subchild name="{{name}}"></x-subchild>'
                        + '</div>',
                    components: {
                        'x-subchild': 'subchild'
                    }
                },

                subchild: {
                    template: '<div>'
                        + '<h4>subchild {{name}}</h4>'
                        + '<x-main/>'
                        + '</div>',
                    components: {
                        'x-main': 'main'
                    }
                }
            }
        });

        var ClassChild = factory.getComponentClass('child');
        var ClassMain = factory.getComponentClass('main');
        var ClassSubChild = factory.getComponentClass('subchild');
        var ClassRoot = factory.getComponentClass('root');
        expect(ClassMain.prototype.components['x-child'] === ClassChild).toBeTruthy();
        expect(ClassChild.prototype.components['x-subchild'] === ClassSubChild).toBeTruthy();
        expect(ClassSubChild.prototype.components['x-main'] === ClassMain).toBeTruthy();
        expect(ClassRoot.prototype.components['x-main'] === ClassMain).toBeTruthy();


        var instance = factory.createInstance({
            component: 'root',
            options: {
                data: {
                    name: 'San'
                }
            }
        });
        instance.attach(document.body);

        var h4s = instance.el.getElementsByTagName('h4');
        expect(h4s[0].innerHTML).toBe('main San');
        expect(h4s[1].innerHTML).toBe('child San');
        expect(h4s[2].innerHTML).toBe('subchild San');
        instance.dispose();
    });

    it('should support circular sub component added by factory.addComponent', function () {
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
                }
            }
        });

        factory.addComponent('child', {
            template: '<div>'
                + '<h4>Child {{name}}</h4>'
                + '<x-test></x-test>'
                + '</div>',
            components: {
                'x-test': 'test'
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

        var h4s = instance.el.getElementsByTagName('h4');
        expect(h4s[0].innerHTML).toBe('Test San');
        expect(h4s[1].innerHTML).toBe('Child San');

        var ClassTest = factory.getComponentClass('test');
        var ClassChild = factory.getComponentClass('child');
        expect(ClassTest.prototype.components['x-child'] === ClassChild).toBeTruthy();
        expect(ClassChild.prototype.components['x-test'] === ClassTest).toBeTruthy();

        instance.dispose();
    });


});

describe('get component class', function () {
    it('get component class by name', function () {
        var factory = new SanFactory({
            san: san,
            components: {
                root: {
                    template: '<div>'
                        + '<x-child-a/>'
                        + '<x-child-b/>'
                        + '</div>',
                    components: {
                        'x-child-a': 'childA',
                        'x-child-b': 'childB'
                    }
                },
                childA: {
                    template: '<button>a</button>'
                },
                childB: {
                    template: '<span><x-button/></span>',
                    components: {
                        'x-button': 'childA'
                    }
                }
            }
        });

        var Root = factory.getComponentClass('root');
        var ChildA = factory.getComponentClass('childA');
        var ChildB = factory.getComponentClass('childB');
        expect(typeof Root).toBe('function');
        expect(Root.prototype.components['x-child-a'] === ChildA).toBeTruthy();
        expect(ChildB.prototype.components['x-button'] === ChildA).toBeTruthy();
    });

    it('get all component classes', function () {
        var factory = new SanFactory({
            san: san,
            components: {
                root: {
                    template: '<div>'
                        + '<x-child-a/>'
                        + '<x-child-b/>'
                        + '</div>',
                    components: {
                        'x-child-a': 'childA',
                        'x-child-b': 'childB'
                    }
                },
                childA: {
                    template: '<button>a</button>'
                },
                childB: {
                    template: '<span><x-button/></span>',
                    components: {
                        'x-button': 'childA'
                    }
                }
            }
        });

        var Components = factory.getAllComponentClasses();
        var Root = Components.root;
        var ChildA = Components.childA;
        var ChildB = Components.childB;
        expect(typeof Root).toBe('function');
        expect(Root.prototype.components['x-child-a'] === ChildA).toBeTruthy();
        expect(ChildB.prototype.components['x-button'] === ChildA).toBeTruthy();
    });
});