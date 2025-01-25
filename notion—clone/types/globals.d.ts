/*
    This file extends the global scope by declaring custom types or interfaces that can be used across the entire project without explicitly importing them.

    .d.ts file in typescript is a type declaration file. It contains no-executable code.
*/

export {}   // ensures the file is treated as a module and not a script
import '@clerk/nextjs/server';


// "declare global" is used to add or modify global types/interfaces in typescript.
declare global {
    interface CustomJWTSessionClaims {
        email?: string;
    }
}