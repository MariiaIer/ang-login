import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScriptLoaderService {
  private scripts: { [key: string]: { loaded: boolean, src: string } } = {};

  loadScript(name: string, src: string): Promise<object> {
    if (!this.scripts[name]) {
      this.scripts[name] = { loaded: false, src };
    }

    return new Promise((resolve, reject) => {
      if (this.scripts[name].loaded) {
        resolve({ script: name, loaded: true, status: 'Already Loaded' });
      } else {
        // Load the script
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = this.scripts[name].src;
        script.onload = () => {
          this.scripts[name].loaded = true;
          resolve({ script: name, loaded: true, status: 'Loaded' });
        };
        script.onerror = () => reject({ script: name, loaded: false, status: 'Error' });
        document.head.appendChild(script);
      }
    });
  }
}
