import { Test, TestingModule } from '@nestjs/testing';
import { FilesModule } from './files.module';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

describe('FilesModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [FilesModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should contain the FilesController and FilesService', () => {
    const filesController = module.get<FilesController>(FilesController);
    const filesService = module.get<FilesService>(FilesService);

    expect(filesController).toBeDefined();
    expect(filesService).toBeDefined();
  });
});
