import { Option, isNone, none, some } from "fp-ts/lib/Option";

/**
 * https://dev.to/gcanti/getting-started-with-fp-ts-category-4c9a
 * https://dev.to/gcanti/getting-started-with-fp-ts-functor-36ek
 *
 
 
 A category is a pair (Objects, Morphisms) where:

    Objects is a collection of objects
    Morphisms is a collection of morphisms (or arrows) between the objects

    Each morphism f has a source object A and a target object B where A and B are in Objects.
    We write f: A ⟼ B, and we say "f is a morphism from A to B".

There's an operation ∘, named "composition", such that the following properties must hold


    objects are types
    morphisms are functions
    ∘ is the usual function composition


    We call pure program a function with the following signature

(a: A) => B


 */

function compose<A, B, C>(g: (b: B) => C, f: (a: A) => B): (a: A) => C {
  return a => g(f(a));
}

function liftArray<B, C>(g: (b: B) => C): (fb: Array<B>) => Array<C> {
  return fb => fb.map(g);
}

function liftOption<B, C>(g: (b: B) => C): (fb: Option<B>) => Option<C> {
  return fb => (isNone(fb) ? none : some(g(fb.value)));
}

// function liftA2<B, C, F>(fb: F<B>) {
//  return fb => (fc: F<C>) => F<D>
// }
