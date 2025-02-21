export class ApiResponseDto<T> {
  data: T;
  result: 'success' | 'failure';
  message: string;

  constructor(data: T, result: 'success' | 'failure', message: string) {
    this.data = data;
    this.result = result;
    this.message = message;
  }
}
