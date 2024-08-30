export default function formatString(
  template: string,
  variables: { [key: string]: string | number }
): string {
  return template.replace(/{{(.*?)}}/g, (match, key) => {
    return key in variables ? String(variables[key]) : match;
  });
}
