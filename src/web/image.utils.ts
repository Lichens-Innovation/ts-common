import { getErrorMessage } from '../utils/runtime/errors.utils';
import { isBlank } from '../utils/string/string.utils';
import { type Dimensions } from '../utils/number/dimensions.utils';

const DEFAULT_MAX_DIMENSION = 1600;
const DEFAULT_JPEG_QUALITY = 0.85;

export const loadImage = (blob: Blob): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(blob);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`image decode failed for blob type: ${blob.type}`));
    };

    img.src = objectUrl;
  });

export interface DownscaleToJpegDataUrlArgs {
  blob: Blob;
  maxDimension?: number;
  quality?: number;
}

/** habit-hooks-disable non-essential-comment
 * Decodes a blob via `<img>`, optionally downscales so the longest side is at
 * most `maxDimension`, and re-encodes as a JPEG data URI. Useful when a
 * consumer only accepts PNG/JPEG (e.g. pdfme image cells) and must not embed
 * multi-MB camera photos at full resolution.
 */
export const downscaleToJpegDataUrl = async ({
  blob,
  maxDimension = DEFAULT_MAX_DIMENSION,
  quality = DEFAULT_JPEG_QUALITY,
}: DownscaleToJpegDataUrlArgs): Promise<string> => {
  const img = await loadImage(blob);
  const scale = Math.min(1, maxDimension / Math.max(img.naturalWidth, img.naturalHeight));
  const width = Math.round(img.naturalWidth * scale);
  const height = Math.round(img.naturalHeight * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas 2d context unavailable');

  ctx.drawImage(img, 0, 0, width, height);

  return canvas.toDataURL('image/jpeg', quality);
};

export const hasRechartsElements = (svg: SVGSVGElement): boolean => {
  return (
    svg.querySelector('g.recharts-layer') !== null ||
    svg.querySelector('g.recharts-cartesian-axis') !== null ||
    svg.querySelector('g.recharts-cartesian-grid') !== null ||
    svg.querySelector('path.recharts-curve') !== null
  );
};

export const findRechartsSvg = (svgs: NodeListOf<SVGSVGElement> | SVGSVGElement[]): SVGSVGElement | null => {
  for (const svg of Array.from(svgs)) {
    if (hasRechartsElements(svg)) {
      return svg;
    }
  }

  return null;
};

export const getElement = (id: string): HTMLElement | null => {
  const element = document?.getElementById(id);
  if (!element) {
    // eslint-disable-next-line no-console -- diagnostic: callers only receive null and cannot tell why
    console.info(`[getElement] Element with id "${id}" not found`);
    return null;
  }

  return element;
};

export interface GetRechartsSvgFromElementArgs {
  chartElement: HTMLElement;
  chartElementId: string;
}

export const getRechartsSvgFromElement = ({
  chartElement,
  chartElementId,
}: GetRechartsSvgFromElementArgs): SVGSVGElement | null => {
  const allSvgs = chartElement.querySelectorAll<SVGSVGElement>('svg');
  if (allSvgs.length === 0) {
    // eslint-disable-next-line no-console -- diagnostic: callers only receive null and cannot tell why
    console.info(`[getRechartsSvgFromElement] SVG element not found inside element with id "${chartElementId}"`);
    return null;
  }

  const rechartSvg = findRechartsSvg(allSvgs);
  if (!rechartSvg) {
    // eslint-disable-next-line no-console -- diagnostic: callers only receive null and cannot tell why
    console.info(
      `[getRechartsSvgFromElement] No Recharts SVG element found inside element with id "${chartElementId}"`
    );
    return null;
  }

  return rechartSvg;
};

export const getSvgDimensions = (svgElement: SVGSVGElement): Dimensions => {
  const width = svgElement.clientWidth ?? parseInt(svgElement.getAttribute('width') ?? '800', 10);
  const height = svgElement.clientHeight ?? parseInt(svgElement.getAttribute('height') ?? '600', 10);
  return { width, height };
};

export interface PrepareSvgCloneArgs {
  svgElement: SVGSVGElement;
  dimensions: Dimensions;
}

/** habit-hooks-disable non-essential-comment
 * Works on a clone so the SVG in the DOM is never touched. Explicit width/height are required:
 * an `<img>` loading an SVG without intrinsic dimensions may draw nothing on the canvas in
 * `svgToPngDataUri`, giving an empty PNG.
 */
export const prepareSvgClone = ({ svgElement, dimensions }: PrepareSvgCloneArgs): SVGSVGElement => {
  const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;

  if (!clonedSvg.hasAttribute('width')) {
    clonedSvg.setAttribute('width', dimensions.width.toString());
  }
  if (!clonedSvg.hasAttribute('height')) {
    clonedSvg.setAttribute('height', dimensions.height.toString());
  }

  return clonedSvg;
};

export const convertSvgToDataUri = (svgXml: string): string => {
  const encoder = new TextEncoder();
  const data = encoder.encode(svgXml);
  let binaryString = '';
  for (let i = 0; i < data.length; i++) {
    binaryString += String.fromCharCode(data[i]);
  }
  const base64 = btoa(binaryString);
  return `data:image/svg+xml;base64,${base64}`;
};

export interface ResizeSvgXmlArgs {
  svgXml: string;
  targetWidth: number;
  targetHeight: number;
}

export const resizeSvgXml = ({ svgXml, targetWidth, targetHeight }: ResizeSvgXmlArgs): string => {
  const widthAttr = `width="${targetWidth}"`;
  const heightAttr = `height="${targetHeight}"`;

  let result = svgXml.replace(/\bwidth=["'][^"']*["']/, widthAttr);
  if (!/\bwidth\s*=/.test(result)) {
    result = result.replace(/<svg/, `<svg ${widthAttr}`);
  }

  result = result.replace(/\bheight=["'][^"']*["']/, heightAttr);
  if (!/\bheight\s*=/.test(result)) {
    result = result.replace(/<svg/, `<svg ${heightAttr}`);
  }

  return result;
};

export interface GetChartAsPngDataUriArgs {
  chartElementId: string;
  width: number;
  height: number;
}

const findRechartsSvgById = (chartElementId: string): SVGSVGElement | null => {
  if (isBlank(chartElementId)) return null;

  const chartElement = getElement(chartElementId);
  if (!chartElement) return null;

  return getRechartsSvgFromElement({ chartElement, chartElementId });
};

/** habit-hooks-disable non-essential-comment
 * Renders at the requested size (e.g. a PDF zone), ignoring the SVG's intrinsic dimensions.
 */
export const getChartAsPngDataUri = async ({
  chartElementId,
  width,
  height,
}: GetChartAsPngDataUriArgs): Promise<string | null> => {
  const svgElement = findRechartsSvgById(chartElementId);
  if (!svgElement) return null;

  const svgXml: string = new XMLSerializer().serializeToString(svgElement);
  const resizedXml: string = resizeSvgXml({ svgXml, targetWidth: width, targetHeight: height });
  const svgDataUri: string = convertSvgToDataUri(resizedXml);

  return svgToPngDataUri({
    svgDataUri,
    dimensions: { width, height },
    backgroundColor: 'white',
  });
};

export const getSvgAsBase64DataUri = (chartElementId: string): string | null => {
  const svgXml = getRechartSvgXml(chartElementId);
  if (isBlank(svgXml)) return null;

  return convertSvgToDataUri(svgXml);
};

export const getRechartSvgXml = (chartElementId: string): string | null => {
  const svgElement = findRechartsSvgById(chartElementId);
  if (!svgElement) return null;

  const dimensions = getSvgDimensions(svgElement);
  const clonedSvg: SVGSVGElement = prepareSvgClone({ svgElement, dimensions });
  const svgXml: string = new XMLSerializer().serializeToString(clonedSvg);

  return svgXml;
};

export interface SvgToPngArgs {
  svgDataUri?: string | null;
  dimensions: Dimensions;
  backgroundColor?: string;
}

interface DrawImageToPngArgs {
  img: HTMLImageElement;
  dimensions: Dimensions;
  backgroundColor?: string;
}

const drawImageToPngDataUri = ({ img, dimensions, backgroundColor }: DrawImageToPngArgs): string => {
  const { width, height } = dimensions;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas 2D context');

  if (backgroundColor) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL('image/png');
};

export const svgToPngDataUri = async ({
  svgDataUri,
  dimensions,
  backgroundColor,
}: SvgToPngArgs): Promise<string | null> => {
  if (isBlank(svgDataUri)) return null;

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      try {
        resolve(drawImageToPngDataUri({ img, dimensions, backgroundColor }));
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = (error) => {
      const message = getErrorMessage(error);
      reject(new Error(`Failed to load SVG image: ${message}`));
    };

    img.src = svgDataUri;
  });
};
