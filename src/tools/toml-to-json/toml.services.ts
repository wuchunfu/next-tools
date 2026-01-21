import { parse as parseToml } from 'smol-toml';
import { isNotThrowing } from '../../utils/boolean';

export function isValidToml(toml: string): boolean {
  return isNotThrowing(() => parseToml(toml, { integersAsBigInt: true }));
}
