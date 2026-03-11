import { getErrorMessage, type Dimensions } from "../utils";

export const hasRechartsElements = (svg: SVGSVGElement): boolean => {
  return (
    svg.querySelector("g.recharts-layer") !== null ||
    svg.querySelector("g.recharts-cartesian-axis") !== null ||
    svg.querySelector("g.recharts-cartesian-grid") !== null ||
    svg.querySelector("path.recharts-curve") !== null
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
  const allSvgs = chartElement.querySelectorAll<SVGSVGElement>("svg");
  if (allSvgs.length === 0) {
    console.info(`[getRechartsSvgFromElement] SVG element not found inside element with id "${chartElementId}"`);
    return null;
  }

  const rechartSvg = findRechartsSvg(allSvgs);
  if (!rechartSvg) {
    console.info(`[getRechartsSvgFromElement] No Recharts SVG element found inside element with id "${chartElementId}"`);
    return null;
  }

  return rechartSvg;
};

export const getSvgDimensions = (svgElement: SVGSVGElement): Dimensions => {
  const width = svgElement.clientWidth ?? parseInt(svgElement.getAttribute("width") ?? "800", 10);
  const height = svgElement.clientHeight ?? parseInt(svgElement.getAttribute("height") ?? "600", 10);
  return { width, height };
};

export interface PrepareSvgCloneArgs {
  svgElement: SVGSVGElement;
  dimensions: Dimensions;
}

/**
 * Clones an SVG element and ensures it has the required width and height attributes.
 *
 * This function is necessary for two main reasons:
 *
 * 1. **Defensive cloning**: Cloning prevents modifying the original SVG element in the DOM.
 *    Although `XMLSerializer.serializeToString()` does not modify the element, cloning ensures
 *    that no accidental modifications are made to the source element.
 *
 * 2. **Required width/height attributes**: When converting SVG → PNG via `svgToPngDataUri`,
 *    the HTML Image element requires the SVG to have explicit intrinsic dimensions.
 *    Without width/height attributes, the SVG may not render correctly on the canvas,
 *    resulting in an incorrect or empty PNG image.
 *
 * @param svgElement - The original SVG element to clone
 * @param dimensions - The dimensions to apply to the cloned SVG if attributes are missing
 * @returns A new cloned SVG element with guaranteed width/height attributes
 */
export const prepareSvgClone = ({ svgElement, dimensions }: PrepareSvgCloneArgs): SVGSVGElement => {
  const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;

  if (!clonedSvg.hasAttribute("width")) {
    clonedSvg.setAttribute("width", dimensions.width.toString());
  }
  if (!clonedSvg.hasAttribute("height")) {
    clonedSvg.setAttribute("height", dimensions.height.toString());
  }

  return clonedSvg;
};

export const convertSvgToDataUri = (svgXml: string): string => {
  const encoder = new TextEncoder();
  const data = encoder.encode(svgXml);
  let binaryString = "";
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

/**
 * Modifies SVG XML to set the root <svg> width and height attributes.
 * Used to resize the SVG before converting to PNG at target dimensions (e.g. from PDF layout).
 */
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

/**
 * Gets the Recharts chart as a PNG data URI at the given dimensions (e.g. from PDF zone).
 * Resizes the SVG via resizeSvgXml before conversion; does not use the SVG's intrinsic dimensions.
 */
export const getChartAsPngDataUri = async ({
  chartElementId,
  width,
  height,
}: GetChartAsPngDataUriArgs): Promise<string | null> => {
  if (!chartElementId) {
    return null;
  }

  const chartElement: HTMLElement | null = getElement(chartElementId);
  if (!chartElement) {
    return null;
  }

  const svgElement: SVGSVGElement | null = getRechartsSvgFromElement({ chartElement, chartElementId });
  if (!svgElement) {
    return null;
  }

  const svgXml: string = new XMLSerializer().serializeToString(svgElement);
  const resizedXml: string = resizeSvgXml({ svgXml, targetWidth: width, targetHeight: height });
  const svgDataUri: string = convertSvgToDataUri(resizedXml);

  return svgToPngDataUri({
    svgDataUri,
    dimensions: { width, height },
    backgroundColor: "white",
  });
};

/**
 * Retrieves the SVG from a Recharts chart element and converts it to SVG base64
 * @param chartElementId - The ID of the element containing the chart
 * @returns The SVG encoded in base64 with data URI prefix (data:image/svg+xml;base64,...), or null if an error occurs
 */
export const getSvgAsBase64DataUri = (chartElementId: string): string | null => {
  const svgXml = getRechartSvgXml(chartElementId);
  if (!svgXml) {
    return null;
  }

  return convertSvgToDataUri(svgXml);
};

export const getRechartSvgXml = (chartElementId: string): string | null => {
  if (!chartElementId) {
    console.info(`[getRechartSvgXml] No chart element id provided`);
    return null;
  }

  const chartElement: HTMLElement | null = getElement(chartElementId);
  if (!chartElement) {
    console.info(`[getRechartSvgXml] Element with id "${chartElementId}" not found`);
    return null;
  }

  const svgElement: SVGSVGElement | null = getRechartsSvgFromElement({ chartElement, chartElementId });
  if (!svgElement) {
    console.info(`[getRechartSvgXml] No SVG element found inside element with id "${chartElementId}"`);
    return null;
  }

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

export const svgToPngDataUri = async ({
  svgDataUri,
  dimensions,
  backgroundColor,
}: SvgToPngArgs): Promise<string | null> => {
  if (!svgDataUri) {
    return null;
  }

  const { width, height } = dimensions;

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas 2D context"));
          return;
        }

        if (backgroundColor) {
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);
        const pngDataUri = canvas.toDataURL("image/png");
        resolve(pngDataUri);
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
