import axios from "axios";
import type { Move, PokeapiResponse } from "../interfaces/pokeapi-response.interface";

export class Pokemon {
    public id: number;
    public name: string;
    
    get imageUrl(): string {
        return `https://pokemon.com/${this.id}.jpg`;
    }

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
        console.log('constructor llamado');
    }

    scream() {
        console.log(`${this.name.toUpperCase()}!!!`);
    }

    speak() {
        console.log(`${this.name}, ${this.name}`);
    }

    async getMoves(): Promise<Move[]> {
        // const response = await axios.get('https://pokeapi.co/api/v2/pokemon/4');
        const {data} = await axios.get<PokeapiResponse>('https://pokeapi.co/api/v2/pokemon/4');
        console.log(data.moves);
        return data.moves;
    }

}

// esta forma ya no es funcional en typescript
// export class Pokemon {
//     constructor(
//         public readonly id: number, //no permite editar el valor del objeto luego de inicializar
//         public name: string
//     ) { }
// }

export const charmander = new Pokemon(4, 'Charmander');
// console.log(charmander.imageUrl);
// charmander.speak();
// charmander.scream();

// console.log(charmander.getMoves());
charmander.getMoves();