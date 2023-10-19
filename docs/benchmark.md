# Benchmark

We do aim performance, so you can see the benchmark results here.

|      Name       | Average  | GET `/`  | GET `/id/92?name=QHc` | GET `/api/js` | POST `/api/json` |
| :-------------: | :------: | :------: | :-------------------: | :-----------: | :--------------: |
| Bunicorn 0.0.10 | 85977.58 | 85468.24 |       87349.40        |   86833.95    |     84258.73     |
|    Bun 0.0.0    | 83996.48 | 86949.35 |       83664.37        |   86077.60    |     79294.59     |
|   Hono 3.7.2    | 83603.11 | 85848.63 |       83114.43        |   84393.96    |     81055.42     |
|  Elysia 0.7.15  | 82055.08 | 84941.05 |       81298.26        |   81093.59    |     80887.43     |

You can see the bench source here: https://github.com/ragokan/bunicorn-benchmark

::: info
I have tested more than 10 times, in some tests Bunicorn lost to Hono or Elysia, but in all tests, all frameworks were pretty close.
:::
