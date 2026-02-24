import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import { FilesService } from './files.service';
import { fileFilter, fileNamer } from './helpers';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response,
    @Param('imageName') imageName: string,
  ) {
    const path = this.filesService.getStaticProductImage(imageName);
    res.sendFile(path);
  }

  @Post('product')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
      storage: diskStorage({
        destination: './static/products',
        filename(req, file, callback) {
          if (!file) return callback(new Error('File is empty'), '');
          const fileExtension = file.mimetype.split('/')[1];
          const fileName = `${randomUUID()}.${fileExtension}`;
          return callback(null, fileName);
        },
      }),
    }),
  )
  uploadFile(
    @UploadedFile() // new ParseFilePipe({
    //     // FileTypeValidator puedes pasar los tipos de datos que quieres mediante un regex.
    file //   validators: [
    //     new FileTypeValidator({ fileType: 'image/(png|jpg|jpeg|gif)' }),
    //     // MaxFileSizeValidator agregar el máximo tamaño del archivo, en este caso le puse 3 MB como máximo.
    //     new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 3 }),
    //   ]
    // })
    : Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Make sure that the file is an image');
    }

    // const secureUrl = `${file.filename}`;
    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`;

    return { secureUrl };
  }
}
