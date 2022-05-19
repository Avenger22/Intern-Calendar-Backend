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
        address: "Rr Qazim Vathi",
        bio: "I am Jurgen Hasmeta",
        phone: "0695554532",
        avatar: "avatar1.jpg",
        isDoctor: true  
    },
    {
        id: 2,
        userName: 'atleti22',
        email: 'atletikomadrid@email.com',
        password: bcrypt.hashSync('atleti1234', 8),
        firstName: "Atletiko",
        lastName: "Madrid",
        address: "Rr Bardhyl",
        bio: "I am Atletiko Madrid",
        phone: "0693454532",
        avatar: "avatar2.jpg",
        isDoctor: false
    },
    {
        id: 3,
        userName: 'brajan',
        email: 'brajanhasmeta@email.com',
        password: bcrypt.hashSync('brajan1234', 8),
        firstName: "brajan",
        lastName: "hasmeta",
        address: "Rr Bardhyl e re",
        bio: "I am brajan hasmeta",
        phone: "0693454532",
        avatar: "avatar3.jpg",
        isDoctor: false
    },
    {
        id: 4,
        userName: 'leoMessi22',
        email: 'leomessi@email.com',
        password: bcrypt.hashSync('messi1234', 8),
        firstName: "leo",
        lastName: "messi",
        address: "Rr Bardhyl e re",
        bio: "I am leo",
        phone: "0693454532",
        avatar: "avatare.jpg",
        isDoctor: true
    }
];

const appointments = [
    {
        id: 1,
        price: 350,
        startDate: "2022-05-19T10:00:00",
        endDate: "2022-05-19T11:00:00",
        title: "Kidney visit",
        description: "Vizite tek doktorri kam probleme me kidney",
        status: "pending",
        user_id: 2,
        doctor_id: 1,
        category_id: 1
    },
    {
        id: 2,
        price: 350,
        startDate: "2022-05-23T12:00:00",
        endDate: "2022-05-23T13:00:00",
        title: "Cardiac visit",
        description: "Vizite tek doktorri kam probleme me zemren",
        status: "approved",
        user_id: 2,
        doctor_id: 1,
        category_id: 2
    },
    {
        id: 3,
        price: 350,
        startDate: "2022-05-27T12:00:00",
        endDate: "2022-05-27T13:00:00",
        title: "Thyroid visit",
        description: "Vizite tek doktorri kam probleme me tiroidet",
        status: "pending",
        user_id: 3,
        doctor_id: 1,
        category_id: 2
    }
]

const categories = [
    {
        id: 1,
        category_name: "Kidney",
        category_logo: "kidney.jpg"
    },
    {
        id: 2,
        category_name: "Zemra",
        category_logo: "Zemra.jpg"
    }
]

const bids = [
    {
        id: 1,
        appointment_id: 1,
        bids: 5,
        user_id: 2
    }
]

async function createStuff() {
    
    await prisma.user.deleteMany();

    for (const user of users) {
        await prisma.user.create({ data: user });
    }

    await prisma.category.deleteMany()

    for (const category of categories) {
        await prisma.category.create({ data: category });
    }

    await prisma.appointement.deleteMany()

    for (const appointment of appointments) {
        //@ts-ignore
        await prisma.appointement.create({ data: appointment });
    }

    await prisma.bid.deleteMany()

    for (const bid of bids) {
        await prisma.bid.create({ data: bid });
    }

}

createStuff();