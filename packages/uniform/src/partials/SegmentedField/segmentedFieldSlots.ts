/** Shared owned defaults for segmented date and time fields. */
const segmentedFieldSlots = {
  base: 'group flex w-full flex-col gap-y-1.5 pb-5',
  label: 'block w-full text-foreground subpixel-antialiased text-small',
  inputWrapper:
    'shadow-xs relative inline-flex h-10 min-h-10 w-full cursor-text flex-row items-center gap-3 rounded-small border-2 border-default-200 px-3 transition-colors duration-150 hover:border-default-400 focus-within:hover:border-default-foreground motion-reduce:transition-none',
  innerWrapper: 'flex h-6 w-full items-center gap-x-2 text-default-400',
  input: 'flex h-full w-full gap-x-0.5 font-normal text-small',
  segment:
    'outline-solid focus:shadow-xs group my-auto box-content inline-block rounded-md px-0.5 text-start tabular-nums text-foreground-500 outline-transparent transition-colors first:-ml-0.5 focus:bg-default-400/50 data-[editable=true]:data-[placeholder=true]:text-foreground-500 data-[editable=true]:text-foreground data-[editable=true]:focus:text-default-foreground motion-reduce:transition-none [&:not(:first-child)]:-ml-1',
  helperWrapper:
    'absolute start-0 top-[calc(100%_+_2px)] flex flex-col gap-1.5',
  description: 'text-foreground-500 text-tiny',
  errorMessage: 'text-danger text-tiny',
};

export default segmentedFieldSlots;
