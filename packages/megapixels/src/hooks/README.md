# Shared Megapixels hooks

`useInfiniteVirtualizer` owns viewport measurement, loaded/total-count paging
and load-more/retry timing shared by DataTable and VirtualList. Its tests cover
request timing and row ranges.

Keep component-specific table state in `DataTable/hooks/` and filter validation
in `Filter/hooks/`. Presentation and interaction handlers belong to the owning
subcomponent, without adding hooks just to hide small functions.
