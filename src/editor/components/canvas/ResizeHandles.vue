<template>
  <div class="pointer-events-none absolute inset-0">
    <span
      data-resize-handle="nw"
      class="pointer-events-auto absolute -left-1 -top-1 h-2 w-2 cursor-nwse-resize bg-blue-600"
    />
    <span
      data-resize-handle="n"
      class="pointer-events-auto absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 cursor-ns-resize bg-blue-600"
    />
    <span
      data-resize-handle="ne"
      class="pointer-events-auto absolute -right-1 -top-1 h-2 w-2 cursor-nesw-resize bg-blue-600"
    />
    <span
      data-resize-handle="e"
      class="pointer-events-auto absolute -right-1 top-1/2 h-2 w-2 -translate-y-1/2 cursor-ew-resize bg-blue-600"
    />
    <span
      data-resize-handle="w"
      class="pointer-events-auto absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 cursor-ew-resize bg-blue-600"
    />
    <span
      data-resize-handle="sw"
      class="pointer-events-auto absolute -bottom-1 -left-1 h-2 w-2 cursor-nesw-resize bg-blue-600"
    />
    <span
      data-resize-handle="s"
      class="pointer-events-auto absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 cursor-ns-resize bg-blue-600"
    />
    <span
      data-resize-handle="se"
      class="pointer-events-auto absolute -bottom-1 -right-1 h-2 w-2 cursor-nwse-resize bg-blue-600"
    />
  </div>
</template>
