import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";
import { User } from "src/auth/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity({ name: 'products' })
export class Product {

    @ApiProperty({
        example: 'd41381d1-ea85-4178-b9e1-0da6246384b0',
        description: 'Product ID',
        uniqueItems: true,
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;
    
    @ApiProperty({
        example: 'T-Shirt Teslo',
        description: 'Product title',
        uniqueItems: true,
    })
    @Column('text', {
        unique: true,
    })
    title: string;
    
    @ApiProperty({
        example: 0,
        description: 'Product price',
    })
    @Column('float', {
        default: 0,
    })
    price: number;
    
    @ApiProperty({
        example: 'The Relaxed T Logo Hat is a classic silhouette combined with modern details.',
        description: 'Product description',
    })
    @Column({
        type: 'text',
        nullable: true,
    })
    description: string;
    
    @ApiProperty({
        example: 't_shirt_teslo',
        description: 'Product SLUG- for SEO',
        uniqueItems: true,
    })
    @Column('text', {
        unique: true,
    })
    slug: string;
    
    @ApiProperty({
        example: 10,
        description: 'Product stock',
        default: 0,
    })
    @Column('int', {
        default: 0,
    })
    stock: number;
    
    @ApiProperty({
        example: ['M', 'S', 'L'],
        description: 'Product sizes',
    })
    @Column('text', {
        array: true,
    })
    sizes: string[];
    
    @ApiProperty({
        example: 'Men',
        description: 'Product gender',
    })
    @Column('text')
    gender: string;
    
    @ApiProperty()
    @Column('text', {
        array: true,
        default: [],
    })
    tags: string[];
    
    @ApiProperty()
    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        { cascade: true, eager: true }
    )
    images?: ProductImage[];

    @ManyToOne(
        () => User,
        (user) => user.product,
        { eager: true }
    )
    user: User;

    @BeforeInsert()
    @BeforeUpdate()
    checkSlugInsert() {
        if (!this.slug) {
            this.slug = this.title;
        }
        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '');
    }

}
