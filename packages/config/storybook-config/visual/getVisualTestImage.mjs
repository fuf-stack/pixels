import { parse } from 'yaml';

/** Reads the visual job's image from the CI workflow */
const getVisualTestImage = (source) => {
  const workflow = parse(source);
  const container = workflow?.jobs?.['visual-tests']?.container;
  const image = typeof container === 'string' ? container : container?.image;

  if (typeof image !== 'string' || !image.trim() || image.includes('${{')) {
    throw new Error('CI visual-tests must declare a literal container image');
  }

  return image;
};

export default getVisualTestImage;
