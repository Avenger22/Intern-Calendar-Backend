// #region 'Importing and configuration of Prisma'
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static('public'));

app.get('/', async (req, res) => {
    res.send('Server Up and Running');
});

app.listen(4000, () => {
    console.log(`Server up: http://localhost:4000`);
});
// #endregion


// #region "Token, and getting user loggied in, register, validating if user is logged in"
function createToken(id: number) {

    //@ts-ignore
    const token = jwt.sign({ id: id }, process.env.MY_SECRET, {
        expiresIn: '3days',
    });

    return token;

}

async function getUserFromToken(token: string) {

    //@ts-ignore
    const data = jwt.verify(token, process.env.MY_SECRET);

    const user = await prisma.user.findUnique({
        // @ts-ignore
        where: { id: data.id },
    });

    return user;

}

app.post('/sign-up', async (req, res) => {

    const { email, password, userName } = req.body;

    try {

        const hash = bcrypt.hashSync(password);
        
        const user = await prisma.user.create({
            data: { email: email, password: hash, userName: userName },
        });

        //@ts-ignore
        user.favMovies = [];
        res.send({ user, token: createToken(user.id) });

    } 
    
    catch (err) {
        // @ts-ignore
        res.status(400).send({ error: err.message });
    }

});

app.post('/login', async (req, res) => {

    const { email, password } = req.body;

    // try {
    const user = await prisma.user.findUnique({
        where: { email: email },
    });

    // @ts-ignore
    const passwordMatches = bcrypt.compareSync(password, user.password);
    
    if (user && passwordMatches) {

        const favorites = await prisma.favorite.findMany({
            where: { userId: user?.id },
        });

        //@ts-ignore
        user.favMovies = await prisma.movie.findMany({
            where: { id: { in: favorites.map((f) => f.movieId) } },
            include: { genres: { include: { genre: true } } },
        });

        res.send({ user, token: createToken(user.id) });

    } 
    
    else {
        throw Error('Boom');
    }

    // } catch (err) {
    //     res.status(400).send({ error: 'Email/password invalid.' });
    // }

});

app.get('/validate', async (req, res) => {

    const token = req.headers.authorization || '';

    try {

        const user = await getUserFromToken(token);

        //favourite movies
        const favorites = await prisma.favorite.findMany({
            where: { userId: user?.id },
        });

        //@ts-ignore
        user.favMovies = await prisma.movie.findMany({
            where: { id: { in: favorites.map((f) => f.movieId) } },
            include: { genres: { include: { genre: true } } },
        });

        res.send(user);

    } 
    
    catch (err) {
        // @ts-ignore
        res.status(400).send({ error: err.message });
    }

});
// #endregion