/**
 * https://dev.to/gcanti/getting-started-with-fp-ts-monad-6k
 *
 * 
    Program f 	Program g 	Composition
    pure 	pure 	g ∘ f
    effectful 	pure, n-ary 	liftAn(g) ∘ f
    effectful 	effectful 	flatMap(g) ∘ f
 *
 *
 * Monads are mappable values with of, and flatMap
 * operations
 * 
 * In FP-TS the chain operation is similar flatMap and
 * use in it's place
 */

import { HKT } from "fp-ts/lib/HKT";

flatMap: <A, B>(f: (a: A) => HKT<M, B>) => ((ma: HKT<M, A>) => HKT<M, B>))
chain:   <A, B>(ma: HKT<M, A>, f: (a: A) => HKT<M, B>) => HKT<M, B>



