/// <reference types="vite/client" />

declare module 'sortablejs/modular/sortable.core.esm.js' {
  import Sortable from 'sortablejs';
  export { AutoScroll, OnSpill, MultiDrag, Swap } from 'sortablejs';
  export default Sortable;
}
