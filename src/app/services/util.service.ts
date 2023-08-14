import { Inject, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UtilService {
  constructor() {};

  formatTimestamp(timestamp, replaceFrom, replaceTo) {
    return timestamp.split('.')[0].replace(`/${replaceFrom}/g`, `${replaceTo}`);
  }
}
