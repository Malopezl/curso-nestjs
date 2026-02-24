import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product, ProductImage } from './entities';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { User } from '../auth/entities/user.entity';
import { create } from 'node:domain';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { title } from 'node:process';
import { UpdateProductDto } from './dto/update-product.dto';

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepository: Repository<Product>;
  let productImageRepository: Repository<ProductImage>;

  let mockQueryRunner: {
    connect: jest.Mock;
    startTransaction: jest.Mock;
    manager: {
      delete: jest.Mock;
      save: jest.Mock;
    };
    commitTransaction: jest.Mock;
    rollbackTransaction: jest.Mock;
    release: jest.Mock;
  };

  beforeAll(async () => {
    mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      manager: {
        delete: jest.fn(),
        save: jest.fn(),
      },
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
    };

    const mockQueryBuilder = {
      // Esto es lo mismo que hacer jest.fn().mockReturnThis()
      where: jest.fn(() => mockQueryBuilder),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({
        id: 'UUID_TEST',
        title: 'Test Product',
        slug: 'test-product',
        images: [{ id: 'UUID_IMAGE', url: 'http://example.com/image.jpg' }],
      }),
    };

    const mockProductRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      findOneBy: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      preload: jest.fn(),
      remove: jest.fn(),
    };

    const mockProductImageRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
        {
          provide: getRepositoryToken(ProductImage),
          useValue: mockProductImageRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    productImageRepository = module.get<Repository<ProductImage>>(
      getRepositoryToken(ProductImage),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a product', async () => {
    const createProductDto = {
      title: 'Test Product',
      description: 'This is a test product',
      price: 100,
      stock: 10,
      images: [
        'http://example.com/image1.jpg',
        'http://example.com/image2.jpg',
      ],
    } as CreateProductDto;

    const { images: dtoWithNoImages, ...createDto } = createProductDto;

    const user = { id: '1', email: 'test@example.com' } as User;

    const product = {
      id: '1',
      ...createDto,
      user,
    } as Product;

    jest.spyOn(productRepository, 'create').mockReturnValue(product);
    jest.spyOn(productRepository, 'save').mockResolvedValue(product);
    jest
      .spyOn(productImageRepository, 'create')
      .mockImplementation((imageData) => imageData as ProductImage);

    const result = await service.create(createProductDto, user);

    expect(result).toEqual({
      id: '1',
      title: 'Test Product',
      description: 'This is a test product',
      price: 100,
      stock: 10,
      images: [
        'http://example.com/image1.jpg',
        'http://example.com/image2.jpg',
      ],
      user: { id: '1', email: 'test@example.com' },
    });
  });

  it('should throw a BadRequestException if create product fails', async () => {
    const createProductDto = {
      title: 'Test Product',
      description: 'This is a test product',
      price: 100,
      stock: 10,
      images: [
        'http://example.com/image1.jpg',
        'http://example.com/image2.jpg',
      ],
    } as CreateProductDto;

    const user = { id: '1', email: 'test@example.com' } as User;

    jest
      .spyOn(productRepository, 'create')
      .mockReturnValue(createProductDto as Product);
    jest
      .spyOn(productRepository, 'save')
      .mockRejectedValue({ code: '23505', detail: 'Duplicate entry' });

    await expect(service.create(createProductDto, user)).rejects.toThrow(
      BadRequestException,
    );
    await expect(service.create(createProductDto, user)).rejects.toThrow(
      'Duplicate entry',
    );
  });

  it('should find all products', async () => {
    const paginationDto = {
      limit: 10,
      offset: 0,
      gender: 'men',
    } as PaginationDto;

    const products = [
      {
        id: '1',
        title: 'Test Product 1',
        description: 'This is a test product 1',
        price: 100,
        stock: 10,
        images: [{ id: '1', url: 'http://example.com/image1.jpg' }],
      },
      {
        id: '2',
        title: 'Test Product 2',
        description: 'This is a test product 2',
        price: 200,
        stock: 20,
        images: [{ id: '2', url: 'http://example.com/image2.jpg' }],
      },
    ] as unknown as Product[];

    jest.spyOn(productRepository, 'find').mockResolvedValue(products);
    jest.spyOn(productRepository, 'count').mockResolvedValue(products.length);

    const result = await service.findAll(paginationDto);

    expect(result).toEqual({
      count: 2,
      pages: 1,
      products: products.map((product) => ({
        ...product,
        images: product.images?.map((img) => img.url),
      })),
    });
  });

  it('should find one product by id', async () => {
    const productId = '13cebaac-914a-4938-bcbe-c514e56cb961';

    const product = {
      id: productId,
      title: 'Test Product',
      description: 'This is a test product',
      price: 100,
      stock: 10,
    } as unknown as Product;

    jest.spyOn(productRepository, 'findOneBy').mockResolvedValue(product);

    const result = await service.findOne(productId);

    expect(result).toEqual({
      ...product,
    });
  });

  it('should throw an error if id is not found', async () => {
    const productId = '13cebaac-914a-4938-bcbe-c514e56cb961';

    jest.spyOn(productRepository, 'findOneBy').mockResolvedValue(null);

    await expect(service.findOne(productId)).rejects.toThrow(NotFoundException);
    await expect(service.findOne(productId)).rejects.toThrow(
      `Product with term '${productId}' not found`,
    );
  });

  it('should find one product by term or slug', async () => {
    const result = await service.findOne('Test Product');

    expect(result).toEqual({
      id: 'UUID_TEST',
      title: 'Test Product',
      slug: 'test-product',
      images: [{ id: 'UUID_IMAGE', url: 'http://example.com/image.jpg' }],
    });
  });

  it('should throw an error NotFoundException if product not found', async () => {
    const dto = {} as UpdateProductDto;
    const user = {} as User;

    jest.spyOn(productRepository, 'preload').mockResolvedValue(undefined);

    await expect(service.update('abc', dto, user)).rejects.toThrow(
      new NotFoundException(`Product with id 'abc' not found`),
    );
  });

  it('should update a product', async () => {
    const product = {
      id: 'abc',
      title: 'Test Product',
      description: 'This is a test product',
      price: 100,
      stock: 10,
    } as Product;

    const productId = 'abc';

    const dto = {
      title: 'Updated Product',
      slug: 'updated-product',
    } as UpdateProductDto;

    const user = { id: '1', fullName: 'Test User' } as User;

    jest.spyOn(productRepository, 'preload').mockResolvedValue({
      ...product,
      ...dto,
    } as Product);

    const result = await service.update(productId, dto, user);

    expect(result).toEqual({
      id: 'UUID_TEST',
      title: 'Test Product',
      slug: 'test-product',
      images: ['http://example.com/image.jpg'],
    });
  });

  it('should update a product and commitTransaction', async () => {
    const product = {
      id: 'abc',
      title: 'Test Product',
      description: 'This is a test product',
      price: 100,
      stock: 10,
    } as Product;

    const productId = 'abc';

    const dto = {
      title: 'Updated Product',
      slug: 'updated-product',
      images: [{ id: 'UUID_IMAGE', url: 'http://example.com/image.jpg' }],
    } as unknown as UpdateProductDto;

    const user = { id: '1', fullName: 'Test User' } as User;

    jest.spyOn(productRepository, 'preload').mockResolvedValue({
      ...product,
      ...dto,
    } as Product);

    await service.update(productId, dto, user);

    expect(mockQueryRunner.connect).toHaveBeenCalled();
    expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
    expect(mockQueryRunner.manager.delete).toHaveBeenCalled();
    expect(mockQueryRunner.manager.save).toHaveBeenCalled();
    expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    expect(mockQueryRunner.release).toHaveBeenCalled();
  });

  it('should throw an error and rollbackTransaction if update fails', async () => {
    const product = {
      id: 'abc',
      title: 'Test Product',
      description: 'This is a test product',
      price: 100,
      stock: 10,
    } as Product;

    const productId = 'abc';

    const dto = {
      title: 'Updated Product',
      slug: 'updated-product',
      images: [{ id: 'UUID_IMAGE', url: 'http://example.com/image.jpg' }],
    } as unknown as UpdateProductDto;

    const user = { id: '1', fullName: 'Test User' } as User;

    jest.spyOn(productRepository, 'preload').mockResolvedValue({
      ...product,
      ...dto,
    } as Product);

    mockQueryRunner.manager.save.mockRejectedValue({
      code: 'DB_ERROR',
      detail: 'DB Error',
    });

    await expect(service.update(productId, dto, user)).rejects.toThrow(
      new InternalServerErrorException('Unexpected error, check server logs!'),
    );
    expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    expect(mockQueryRunner.release).toHaveBeenCalled();
  });
});
