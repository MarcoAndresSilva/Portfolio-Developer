import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ContactModule } from './contact/contact.module.js';

@Module({
  imports: [ContactModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
