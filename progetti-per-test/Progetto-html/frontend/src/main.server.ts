// src/main.server.ts
import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

// IMPORTANT: qui accettiamo il BootstrapContext e lo passiamo a bootstrapApplication
const bootstrap = (context: BootstrapContext) => {
  return bootstrapApplication(AppComponent, config, context);
};

export default bootstrap;
