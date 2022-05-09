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
        expiresIn: '3days'
    });

    return token;

}

async function getUserFromToken(token: string) {

    //@ts-ignore
    const data = jwt.verify(token, process.env.MY_SECRET);

    const user = await prisma.user.findUnique({
        // @ts-ignore
        where: { id: data.id }
    });

    return user;

}

app.post('/sign-up', async (req, res) => {

    const { email, password, userName, firstName, lastName, isAdmin } = req.body;

    try {

        const hash = bcrypt.hashSync(password);
        
        const user = await prisma.user.create({
            //@ts-ignore
            data: { email: email, password: hash, userName: userName, firstName: firstName, lastName: lastName, isAdmin: isAdmin },
        });

        res.send({ user, token: createToken(user.id) });

    } 
    
    catch (err) {
        // @ts-ignore
        res.status(400).send({ error: err.message });
    }

});

app.post('/login', async (req, res) => {

    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
        where: { email: email }
    });

    // @ts-ignore
    const passwordMatches = bcrypt.compareSync(password, user.password);
    
    if (user && passwordMatches) {
        res.send({ user, token: createToken(user.id) });
    } 
    
    else {
        throw Error('Boom');
    }

});

app.get('/validate', async (req, res) => {

    const token = req.headers.authorization || '';

    try {
        const user = await getUserFromToken(token);
        res.send(user);
    } 
    
    catch (err) {
        // @ts-ignore
        res.status(400).send({ error: err.message });
    }

});
// #endregion


// #region "REST API endpoints"
app.get('/users', async (req, res) => {

    try {
        const users = await prisma.user.findMany();
        res.send(users);
    } 
    
    catch (err) {
        // @ts-ignore
        res.status(400).send({ error: err.message });
    }

});
// #endregion