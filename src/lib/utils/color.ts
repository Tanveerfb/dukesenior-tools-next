export const NAMED_COLORS = [
  { name: 'None', value: '' },
  { name: 'Red', value: '#ff4d4f' },
  { name: 'Orange', value: '#ffa940' },
  { name: 'Yellow', value: '#ffd666' },
  { name: 'Green', value: '#73d13d' },
  { name: 'Blue', value: '#40a9ff' },
  { name: 'Indigo', value: '#5c6ac4' },
  { name: 'Purple', value: '#9254de' },
  { name: 'Gray', value: '#bfbfbf' },
];

export function isValidHex(v?: string){
  if(!v) return false;
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v);
}
