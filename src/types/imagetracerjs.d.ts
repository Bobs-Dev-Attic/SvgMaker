declare module 'imagetracerjs' {
  interface ImageTracerOptions {
    numberofcolors?: number;
    mincolorratio?: number;
    colorquantcycles?: number;
    ltres?: number;
    qtres?: number;
    pathomit?: number;
    rightangleenhance?: boolean;
    strokewidth?: number;
    linefilter?: boolean;
    scale?: number;
    roundcoords?: number;
    viewbox?: boolean;
    blurradius?: number;
    blurdelta?: number;
  }
  
  const ImageTracer: {
    imagedataToSVG(imageData: ImageData, options?: ImageTracerOptions): string;
    imageToSVG(url: string, callback: (svg: string) => void, options?: ImageTracerOptions): void;
  };
  
  export default ImageTracer;
}
