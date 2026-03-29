declare module "@babel/standalone" {
  export interface BabelTransformResult {
    code?: string;
  }

  export function transform(
    code: string,
    options?: Record<string, unknown>
  ): BabelTransformResult;
}
