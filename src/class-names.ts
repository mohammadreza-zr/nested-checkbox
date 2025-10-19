/**
 * give class names and return string
 *
 * example:
 *
 *
 * classNames('class1', 'class2', { class2:true, show:class3_module, [class4_module]:false })
 * @param props
 * @returns string
 */
export const classNames = (...props: (string | Record<string, any>)[]): string => {
  const classes: string[] = [];

  for (const item of props) {
    if (typeof item === 'string') {
      classes.push(item);
    } else if (item && typeof item === 'object') {
      for (const [key, value] of Object.entries(item)) {
        if (value === true) {
          classes.push(key);
        } else if (value && typeof value === 'string') {
          classes.push(value);
        }
      }
    }
  }

  return classes.join(' ');
};
