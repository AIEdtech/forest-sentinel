declare module '@google/earthengine' {
  export const data: any;
  export const Geometry: any;
  export const Date: any;
  export const ImageCollection: any;
  export const Filter: any;
  export const Reducer: any;
  export function initialize(
    clientId: any,
    clientSecret: any,
    success?: () => void,
    error?: (err: any) => void
  ): void;
}
