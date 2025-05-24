import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'base64Image',
})
export class ImagePipe implements PipeTransform {

  transform(
    input: Uint8Array | string | undefined, 
    mime: string = 'jpeg'
  ): string {
    if (!input) {
      return '';
    }

    let base64: string;

    if (input instanceof Uint8Array) {
      let binary = '';
      const bytes = new Uint8Array(input);
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      base64 = window.btoa(binary);
    } 
    else {
      base64 = input.includes(',') ? input.split(',')[1] : input;
    }

    return `data:image/${mime};base64,${base64}`;
  }
}