import { Test } from '@nestjs/testing';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { Response } from 'express';
import { BadRequestException } from '@nestjs/common';

describe('FilesController', () => {
  let controller: FilesController;
  let service: FilesService;

  beforeEach(async () => {
    const mockService = {
      getStaticProductImage: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn().mockReturnValue('http://localhost:3000'),
    };

    const module = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        {
          provide: FilesService,
          useValue: mockService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<FilesController>(FilesController);
    service = module.get<FilesService>(FilesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return file path when findProductImage is called', () => {
    const mockRes = {
      sendFile: jest.fn(),
    } as unknown as Response;

    const imageName = 'test-image.jpg';
    const expectedPath = `/static/products/${imageName}`;

    jest.spyOn(service, 'getStaticProductImage').mockReturnValue(expectedPath);

    controller.findProductImage(mockRes, imageName);

    expect(mockRes.sendFile).toHaveBeenCalled();
    expect(mockRes.sendFile).toHaveBeenCalledWith(expectedPath);
  });

  it('should return secure URL when uploadFile is called', () => {
    const mockFile = {
      filename: 'test-image.jpg',
      mimetype: 'image/jpeg',
    } as Express.Multer.File;

    const expectedSecureUrl = `http://localhost:3000/files/product/${mockFile.filename}`;

    const result = controller.uploadFile(mockFile);

    expect(result).toEqual({ secureUrl: expectedSecureUrl });
  });

  it('should throw BadRequestException when uploadFile is called with empty file', () => {
    expect(() =>
      controller.uploadFile(null as unknown as Express.Multer.File),
    ).toThrow(new BadRequestException('Make sure that the file is an image'));
  });
});
