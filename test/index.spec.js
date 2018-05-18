
describe('main', () => {

    it('env check', () => {
        expect(san.version).toBe('3.5.9');
        expect(require('san').version).toBe('3.5.4');
    });

    it('is a function', () => {
        expect(typeof SanFactory).toBe('function');
    });
});

describe('createInsance', () => {
    it('by data option', () => {
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

    it('by el reverse', done => {
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
        instance.nextTick(() => {
            expect(instance.el.innerHTML).toContain('Hello ER');
            instance.dispose();
            done();
        })
    });

    it('setter and property inject', () => {
        var factory = new SanFactory({
            san: san,
            components: {
                test: {
                    template: '<h4>Hello {{name}}</h4>'
                },

                setAdder: function (adder) {
                    this.add = adder;
                },

                doAdd: function (a, b) {
                    return this.add(a, b);
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
                adder: function (a, b) {
                    return a + b + 10;
                },

                max: function (a, b) {
                    return Math.max(a, b);
                }
            }
        });

        instance.attach(document.body);
        expect(instance.doAdd(5, 10)).toBe(25);
        expect(instance.max(5, 10)).toBe(10);

        instance.dispose();
    });
});