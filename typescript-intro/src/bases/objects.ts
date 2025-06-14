export const pokemonIds = [1, 20, 30, 34, 66];

// pokemonIds.push(+'1');
// console.log(pokemonIds);

interface Pokemon {
    id: number;
    name: string;
    age?: number; //opcional
}

export const bulbasaur: Pokemon = {
    id: 1,
    name: 'Bulbasaur',
}

export const charmander: Pokemon = {
    id: 4,
    name: 'Charmander',
    age: 1,
}

export const pokemons: Pokemon[] = [];

pokemons.push(charmander, bulbasaur);

console.log(pokemons);
