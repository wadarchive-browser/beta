declare module 'flexsearch/src/document' {
    import type { StoreOption } from 'flexsearch';
    import type { Document as Document1 } from 'flexsearch';
    export default class Document<T, Store extends StoreOption = false> extends Document1<T, Store> {
    }
}