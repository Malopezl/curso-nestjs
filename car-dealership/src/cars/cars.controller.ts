import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { CarsService } from './cars.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';

@Controller('cars')
export class CarsController {

    constructor(
        private readonly carsService: CarsService
    ) { }

    @Get()
    getAllCars() {
        return this.carsService.findAll();
    }

    @Get(':id')
    getCarById(@Param('id', ParseUUIDPipe) id: string) {
        console.log({ id });
        return this.carsService.findOneById(id);
    }

    @Post()
    createCar(@Body() createCar: CreateCarDto) {
        return this.carsService.create(createCar);
    }

    @Patch(':id')
    patchCar(@Param('id', ParseUUIDPipe) id: string, @Body() updateCar: UpdateCarDto) {
        return this.carsService.update(id, updateCar);
    }

    @Delete(':id')
    deleteCar(@Param('id', ParseUUIDPipe) id: string) {
        return this.carsService.delete(id);
    }

}
