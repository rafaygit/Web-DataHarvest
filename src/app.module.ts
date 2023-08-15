import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScrapperService } from './scrapper/scrapper.service';
import { ScrapperModule } from './scrapper/scrapper.module';

@Module({
  imports: [ScrapperModule],
  controllers: [AppController],
  providers: [AppService, ScrapperService],
})
export class AppModule {}
