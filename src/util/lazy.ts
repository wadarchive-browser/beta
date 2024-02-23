// https://stackoverflow.com/a/42846277
const { defineProperty, getPrototypeOf } = Object;

interface TypedPropertyDescriptor<T, ThisType> {
    enumerable?: boolean;
    configurable?: boolean;
    writable?: boolean;
    value?: T;
    get?: (this: ThisType) => T;
    set?: (this: ThisType, value: T) => void;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export default function lazy<This extends { constructor: Function }, PropertyName extends keyof This & string, PropertyType>(target: This, name: PropertyName, { get: initializer, enumerable, configurable, set: setter }: TypedPropertyDescriptor<PropertyType, This> = {}): TypedPropertyDescriptor<PropertyType, This> {
    const { constructor } = target;
    if (initializer === undefined) {
        throw `@lazy can't be set as a property \`${name}\` on ${constructor.name} class, using a getter instead!`;
    }
    if (setter) {
        throw `@lazy can't be annotated with get ${name}() existing a setter on ${constructor.name} class!`;
    }

    function set(this: This, value: PropertyType) {
        defineProperty(this, name, {
            enumerable: enumerable,
            configurable: configurable,
            value: value
        });
        return value;
    }

    return {
        get(this: This) {
            // static access
            if (this === target) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return initializer as any;
            }
            //note:subclass.prototype.foo when foo exists in superclass nor subclass,this will be called
            if (this.constructor !== constructor && getPrototypeOf(this).constructor === constructor) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return initializer as any;
            }
            return set.call(this, initializer.call(this));
        },
        set
    };
}