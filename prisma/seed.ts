import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

const users = [
    {
        id: 1,
        userName: 'avenger22',
        email: 'jurgenhasmeta@email.com',
        password: bcrypt.hashSync('jurgen123', 8),
        firstName: "Jurgen",
        lastName: "Hasmeta",
        isAdmin: true  
    },
    {
        id: 2,
        userName: 'atleti22',
        email: 'atletiko@email.com',
        password: bcrypt.hashSync('atleti123', 8),
        firstName: "Atletiko",
        lastName: "Madrid",
        isAdmin: false
    }
];

async function createStuff() {
    
    await prisma.user.deleteMany();

    for (const user of users) {
        await prisma.user.create({ data: user });
    }

    // await prisma.genre.deleteMany();

    // for (const genre of genres) {
    //     await prisma.genre.create({ data: genre });
    // }

}

createStuff();