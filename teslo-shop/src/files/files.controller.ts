import { BadRequestException, Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileFilter } from './helpers';
import { v4 as uuid } from 'uuid';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) { }

  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response,
    @Param('imageName') imageName: string,
  ) {
    const path = this.filesService.getStaticProductImage(imageName);
    res.sendFile(path);
  }

  @Post('product')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter,
    storage: diskStorage({
      destination: './static/products',
      filename(req, file, callback) {
        if (!file) return callback(new Error('File is empty'), '');
        const fileExtension = file.mimetype.split('/')[1];
        const fileName = `${uuid()}.${fileExtension}`;
        return callback(null, fileName);
      },
    }),
  }))
  uploadFile(@UploadedFile(
    // new ParseFilePipe({
    //   validators: [
    //     // FileTypeValidator puedes pasar los tipos de datos que quieres mediante un regex.
    //     new FileTypeValidator({ fileType: 'image/(png|jpg|jpeg|gif)' }),
    //     // MaxFileSizeValidator agregar el máximo tamaño del archivo, en este caso le puse 3 MB como máximo.
    //     new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 3 }),
    //   ]
    // })
  ) file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Make sure that the file is an image');
    }

    // const secureUrl = `${file.filename}`;
    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`;

    return { secureUrl };
  }

}
