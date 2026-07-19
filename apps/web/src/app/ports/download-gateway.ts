export interface DownloadGateway {
  download(fileName: string, bytes: Uint8Array, mimeType: string): Promise<void>;
  downloadText(fileName: string, text: string, mimeType: string): Promise<void>;
}

export class BrowserDownloadGateway implements DownloadGateway {
  async download(fileName: string, bytes: Uint8Array, mimeType: string): Promise<void> {
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: mimeType });
    this.trigger(fileName, blob);
  }

  async downloadText(fileName: string, text: string, mimeType: string): Promise<void> {
    const blob = new Blob([text], { type: mimeType });
    this.trigger(fileName, blob);
  }

  private trigger(fileName: string, blob: Blob): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }
}
