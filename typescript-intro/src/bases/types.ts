export let name: string = 'Fernando';
export const age: number = 23;
export const isValid: boolean = true;

name = 'Melissa';
// name = 123;
// name = true;

export const templateString = ` Esto es un string
multilinea
que puede tener
" dobles
' simple
inyectar valores ${name}
expresiones ${ 1 + 1 }
numeros: ${age}
booleanos: ${isValid}`

console.log(templateString);
