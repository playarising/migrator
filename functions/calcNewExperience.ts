export function calcNewExperience(
  summoners: number,
  gold: number,
  material: number,
  items: number,
  total_exp: number
): number {
  let new_exp = 0;
  new_exp += summoners;
  new_exp += gold / 1000;
  new_exp += material / 50;
  new_exp += items * 10;
  new_exp += total_exp / 1000;
  return new_exp;
}
