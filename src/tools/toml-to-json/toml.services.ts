import { parse as parseToml } from 'iarna-toml-esm';
import { isNotThrowing } from '../../utils/boolean';

export function isValidToml(toml: string): boolean {
  return isNotThrowing(() => parseToml(toml));
}
