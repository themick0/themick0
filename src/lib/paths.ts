/** Site-relative links also work when the site is hosted in a subdirectory. */
export function pathTo(path = ''): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}
