import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class LegalMetaService {

  constructor(private title: Title, private meta: Meta) {}

  set(title: string, desc: string) {
    this.title.setTitle(title + ' | Uptrix Hub');
    this.meta.updateTag({ name: 'description', content: desc });
    this.meta.updateTag({ name: 'robots', content: 'index,follow' });
  }
}
