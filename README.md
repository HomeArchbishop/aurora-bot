# Bot (Aurora)

self-use jobs- and middleware-based bot. Do not abuse it.

License [AGPL-3.0](LICENSE)

```ts
app
  .useMw(someMw)
  .useMw(anotherMw)
  .useJob('*', someJob)
  .start()
```
