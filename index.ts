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
      expiresIn: '1days'
    });

    return token;

}

async function getUserFromToken(token: string) {

  //@ts-ignore
  const data = jwt.verify(token, process.env.MY_SECRET);

  const user = await prisma.user.findUnique({
      // @ts-ignore
      where: { id: data.id },
      include: { postedAppointements: { include: { normalUser: true } }, acceptedAppointemets: true, freeAppointements: true }
  });

  return user;

}

app.post('/sign-up', async (req, res) => {

    const { email, password, userName, firstName, lastName, address, bio, phone, avatar, isDoctor } = req.body;

    try {

        const hash = bcrypt.hashSync(password);
        
        const user = await prisma.user.create({

            //@ts-ignore
            data: { 
                email: email, 
                password: hash, 
                userName: userName, 
                firstName: firstName, 
                lastName: lastName,
                //@ts-ignore
                address: address,
                bio: bio,
                phone: phone,
                avatar: avatar, 
                isDoctor: isDoctor === "true" ? true : false
            },

            include: { postedAppointements: { include: { normalUser: true } }, acceptedAppointemets: true }

        });

        res.send({ user, token: createToken(user.id) });

    } 
    
    catch (err) {
        // @ts-ignore
        res.status(400).send({ error: err.message });
    }

});

app.post('/login', async (req, res) => {

  const { emailLogin, password } = req.body;

  // const emailInput = emailLogin

  // console.log(emailLogin)
  // console.log(password)

  const user: any = await prisma.user.findFirst({
    where: { email: emailLogin},
    include: { postedAppointements: { include: { normalUser: true } }, acceptedAppointemets: true, freeAppointements: true }
  });

  if (user?.password === undefined || user?.password === null || !user) {
    res.status(404).send({ user, token: "" });
  }

  else {

    // @ts-ignore
    const passwordMatches = bcrypt.compareSync(password, user.password);

    // console.log(passwordMatches)
    
    if (user && passwordMatches) {
      res.send({ user, token: createToken(user.id) });
    } 
    
    else {
      // console.log(user)
      res.status(404).send({ error: "user or password incorrect" });
    }

    //weird bug like only 1 user logs in

  }

});

app.get('/validate', async (req, res) => {

    // const token = req.headers.authorization || '';
    const token = String(req.query.token)

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


// #region "Users as normal users endpoints"
app.get('/users', async (req, res) => {

    try {

        const users = await prisma.user.findMany({

            include: {
                postedAppointements: true
            },

            where: {
                //@ts-ignore
                isDoctor: false
            }

        });

        res.send(users)
  
    } 
    
    catch (err) {
        // @ts-ignore
        res.status(400).send({ error: err.message });
    }

});

app.get("/users/:id", async (req, res) => {

    const id = Number(req.params.id);

    try {

      const employee: any = await prisma.user.findUnique({
        where: { id },
        //@ts-ignore
        include: { acceptedAppointemets: true, postedAppointements: true}
      });

      if (employee) {
        res.send(employee);
      } 
      
      else {
        res.status(404).send({ error: "Employee not found" });
      }

    } 
    
    catch (err) {
      //@ts-ignore
      res.status(400).send({ error: err.message });
    }

});
// #endregion

// #region "Users as doctors endpoints"
app.get('/doctors', async (req, res) => {

    try {

        const doctors = await prisma.user.findMany({

            include: {
                acceptedAppointemets: true,
                freeAppointements: true
            },

            where: {
                //@ts-ignore
                isDoctor: true
            }

        });

        res.send(doctors)
  
    } 
    
    catch (err) {
        // @ts-ignore
        res.status(400).send({ error: err.message });
    }

});

app.get("/doctors/:id", async (req, res) => {

    const id = Number(req.params.id);

    try {

      const doctor = await prisma.user.findUnique({
        where: { id },
        include: { acceptedAppointemets: true }
      });

      if (doctor) {
        res.send(doctor);
      } 
      
      else {
        res.status(404).send({ error: "Doctor not found" });
      }

    } 
    
    catch (err) {
      //@ts-ignore
      res.status(400).send({ error: err.message });
    }

});
// #endregion

// #region "Categories endpoints"
app.get('/categories', async (req, res) => {

    try {

        const categories = await prisma.category.findMany({

            include: {
                appointements: true
            }

        });

        res.send(categories)
  
    } 
    
    catch (err) {
        // @ts-ignore
        res.status(400).send({ error: err.message });
    }

});

app.get("/categories/:id", async (req, res) => {

    const id = Number(req.params.id);

    try {

      const category = await prisma.category.findUnique({

        where: { id },

        //@ts-ignore
        include: { appointements: true}

      });

      if (category) {
        res.send(category);
      } 
      
      else {
        res.status(404).send({ error: "Category not found" });
      }

    } 
    
    catch (err) {
      //@ts-ignore
      res.status(400).send({ error: err.message });
    }

});
// #endregion

// #region "Appointements endpoints"
app.get('/appointements', async (req, res) => {

    try {

        const appointements = await prisma.appointement.findMany({

            include: {
                normalUser: true,
                doctor: true,
                category: true,
                bids: true
            }

        });

        res.send(appointements)
  
    } 
    
    catch (err) {
        // @ts-ignore
        res.status(400).send({ error: err.message });
    }

});

app.get("/appointements/:id", async (req, res) => {

    const id = Number(req.params.id);

    try {

      const appointement = await prisma.appointement.findUnique({

        where: { id },

        include: {
            normalUser: true,
            doctor: true,
            category: true,
            bids: true
        }

      });

      if (appointement) {
        res.send(appointement);
      } 
      
      else {
        res.status(404).send({ error: "Appointement not found" });
      }

    } 
    
    catch (err) {
      //@ts-ignore
      res.status(400).send({ error: err.message });
    }

});

app.post('/appointements', async (req, res) => {

  const { 
    price, 
    startDate, 
    endDate,  
    title, 
    description, 
    status, 
    category_id, 
    user_id, 
    doctor_id,
    doctor_post_id
  } = req.body

  const token = req.headers.authorization

  try {

    const createdAppointement = await prisma.appointement.create({
      //@ts-ignore
      data: { price, startDate, endDate, title, description, status, user_id: user_id, doctor_id: doctor_id, category_id: category_id, doctor_post_id: doctor_post_id }
    })

    let doctor

    if (doctor_id === null && user_id === null) {

      doctor = await prisma.user.findFirst({

        include: {
            acceptedAppointemets: true,
            freeAppointements: true
        },
  
        where: {
            //@ts-ignore
            isDoctor: true,
            id: doctor_post_id
        }
  
      });

    }

    else {

      doctor = await prisma.user.findFirst({

        include: {
            acceptedAppointemets: true,
            freeAppointements: true
        },
  
        where: {
            //@ts-ignore
            isDoctor: true,
            id: doctor_id
        }
  
      });

    }

    //@ts-ignore
    const user: any = await getUserFromToken(token)

    if (token && doctor) {
      res.send({doctorServer: doctor, patientServer: user})
    }

  }

  catch (err) {
    //@ts-ignore
    res.status(400).send({ error: err.message })
  }

})

app.put('/appointements/:id', async (req, res) => {

    const { status, doctor_id } = req.body

    const token = req.headers.authorization

    const id = Number(req.params.id)

    try {

      await prisma.appointement.update({ where: { id }, data: { status } })
      
      const doctor = await prisma.user.findFirst({

        include: {
            acceptedAppointemets: true,
            freeAppointements: true
        },
  
        where: {
          //@ts-ignore
          isDoctor: true,
          id: doctor_id
        }
  
      });

      //@ts-ignore
      const user: any = await getUserFromToken(token)
  
      if (token && doctor) {
        res.send({doctorServer: doctor, patientServer: user})
      }

    } 
    
    catch (err) {
      //@ts-ignore
      res.status(400).send({ error: err.message })
    }

})

app.patch('/appointements/:id', async (req, res) => {

  const {
    price,
    startDate,
    endDate,
    title,
    description,
    status,
    user_id,
    doctor_id,
    doctor_post_id,
    category_id
   } = req.body

  const token = req.headers.authorization

  const id = Number(req.params.id)

  const updatedAppointement = {
    price,
    startDate,
    endDate,
    title,
    description,
    status,
    user_id,
    doctor_id,
    doctor_post_id,
    category_id
  }

  try {

    await prisma.appointement.update({ where: { id }, data: updatedAppointement })
    
    const doctor = await prisma.user.findFirst({

      include: {
          acceptedAppointemets: true,
          freeAppointements: true
      },

      where: {
        //@ts-ignore
        isDoctor: true,
        id: doctor_id
      }

    });

    //@ts-ignore
    const user: any = await getUserFromToken(token)

    if (token && doctor) {
      res.send({doctorServer: doctor, patientServer: user})
    }

  } 
  
  catch (err) {
    //@ts-ignore
    res.status(400).send({ error: err.message })
  }

})

app.delete("/appointements/:id", async (req, res) => {

  const idParam = Number(req.params.id);
  const token = req.headers.authorization;

  console.log(idParam, token)

  try {

    const appointement = await prisma.appointement.findUnique({
      where: { id: idParam }
    });

    console.log(appointement)

    if (appointement && token) {

      const appointement = await prisma.appointement.delete({
        where: { id: idParam }
      });

      console.log(appointement)
      
      const updatedUser = await getUserFromToken(token as string);

      let updatedDoctor;

      if (appointement.doctor_post_id !== null) {

        updatedDoctor = await prisma.user.findUnique({
          //@ts-ignore
          where: { id: appointement.doctor_post_id },
          include: { acceptedAppointemets: true, freeAppointements: true }
        });

      } 
      
      else {

        updatedDoctor = await prisma.user.findUnique({
          //@ts-ignore
          where: { id: appointement.doctor_id },
          include: { acceptedAppointemets: true, freeAppointements: true }
        });

      }

      res.send({
        msg: "Event deleted succesfully",
        updatedUser,
        updatedDoctor,
      });

    } 
    
    else {

      throw Error(
        "You are not authorized, or Event with this Id doesnt exist!"
      );

    }

  } 
  
  catch (err) {
    //@ts-ignore
    res.status(400).send({ error: err.message });
  }

});
// #endregion

// #region "Bids endpoints"
app.get('/bids', async (req, res) => {

    try {

        const bids = await prisma.bid.findMany({

            include: {
                normalUser: true,
                appointement: true
            }

        });

        res.send(bids)
  
    } 
    
    catch (err) {
        // @ts-ignore
        res.status(400).send({ error: err.message });
    }

});

app.get("/bids/:id", async (req, res) => {

    const id = Number(req.params.id);

    try {

      const bid = await prisma.bid.findUnique({

        where: { id },

        include: {
            normalUser: true,
            appointement: true
        }

      });

      if (bid) {
        res.send(bid);
      } 
      
      else {
        res.status(404).send({ error: "Bid not found" });
      }

    } 
    
    catch (err) {
      //@ts-ignore
      res.status(400).send({ error: err.message });
    }

});

app.delete('/bids/:id', async (req, res) => {

    const id = Number(req.params.id)

    try {
      const bid = await prisma.bid.delete({ where: { id } })
      res.send(bid)
    }

    catch (err) {
      //@ts-ignore
      res.status(400).send({ error: err.message })
    }

})

app.post('/bids', async (req, res) => {

    const { appointment_id, bids, user_id } = req.body

    try {

      const bid = await prisma.bid.create({
        //@ts-ignore
        data: { appointment_id, bids, user_id }
      })

      res.send(bid)

    }

    catch (err) {
      //@ts-ignore
      res.status(400).send({ error: err.message })
    }

})

app.get('/bids/:project_id', async (req, res) => {

    const appointment_id = Number(req.params.project_id)
    const bid = await prisma.bid.findMany({ include: { normalUser: true }, where: { appointment_id } })
  
    res.send(bid)
  
})
// #endregion


// #endregion