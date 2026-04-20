import axios from 'axios';

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.message === 'Network Error' || error.code === 'ECONNABORTED') {
      return 'Baglanti sorunu olustu. Internetinizi veya backend servisini kontrol edip tekrar deneyin.';
    }

    return (
      (error.response?.data as { message?: string } | undefined)?.message ??
      error.message ??
      'Bir hata olustu'
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Beklenmedik bir hata olustu';
}
