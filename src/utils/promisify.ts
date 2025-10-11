type FunctionWithDoubleCallback<R, D, E> = (r: R, cbSuccess: (d: D) => void, cbError: (e: E) => void) => void

export function promisify<R, D, E> (fn: FunctionWithDoubleCallback<R, D, E>) {
  return (r: R): Promise<D> => {
    return new Promise((resolve, reject) => {
      fn(r, resolve, reject)
    })
  }
}
