import {
  NonNegativeInteger,
  prismNonNegativeInteger
} from "newtype-ts/lib/NonNegativeInteger";
import { fromNewtype } from "io-ts-types";
import { number } from "io-ts";
import { iso } from "newtype-ts";
/**
 * Create custom types to better represent values.
 *
 * Exmple: There is an number type but there is no type for NonNegtiveInteger
 *
 * https://gcanti.github.io/newtype-ts/
 */

const nonNegativeIntegerIso = iso<NonNegativeInteger>();

let notNegative = nonNegativeIntegerIso.wrap(10);
