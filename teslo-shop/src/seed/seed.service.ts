import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {

  constructor(
    private readonly productsService: ProductsService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async runSeed() {
    await this.deleteTables();
    const adminUser = await this.insertUsers();
    await this.insertNewProducts(adminUser);
    return 'Seed executed';
  }

  private async deleteTables() {
    await this.productsService.deleteAllProducts();

    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder
      .delete()
      .where({})
      .execute();

  }

  private async insertUsers() {
    const seedUsers = initialData.users;

    const users: User[] = [];

    seedUsers.forEach(user => {
      const {password, ...userInfo} = user;
      users.push(this.userRepository.create({
        ...userInfo,
        password: bcrypt.hashSync(password, 10),
      }));
    });

    await this.userRepository.save(users);

    return users[0];
  }

  private async insertNewProducts(user: User) {
    await this.productsService.deleteAllProducts();

    const products = initialData.products;

    const insertPromises: Promise<{
      images: string[],
      id: string,
      title: string,
      price: number,
      description: string,
      slug: string,
      stock: number,
      sizes: string[],
      gender: string,
      tags: string[],
    } | undefined>[] = [];

    products.forEach(product => {
      insertPromises.push(this.productsService.create(product, user));
    });

    await Promise.all(insertPromises);

  }

}
