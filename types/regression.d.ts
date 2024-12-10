declare module 'regression' {
  interface RegressionResult {
    equation: number[];
    points: number[][];
    string: string;
    r2: number;
    predict(x: number): number[];
  }

  interface RegressionOptions {
    order?: number;
    precision?: number;
  }

  interface Regression {
    linear(data: number[][], options?: RegressionOptions): RegressionResult;
    exponential(data: number[][], options?: RegressionOptions): RegressionResult;
    polynomial(data: number[][], options?: RegressionOptions): RegressionResult;
    power(data: number[][], options?: RegressionOptions): RegressionResult;
    logarithmic(data: number[][], options?: RegressionOptions): RegressionResult;
  }

  const regression: Regression;
  export default regression;
} 