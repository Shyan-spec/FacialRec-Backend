const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs')
const cors = require('cors')
const knex = require('knex');
const register = require('./connecters/register');

const db = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'shyanw',
        password: '',
        database : 'facialrec'
    }

    });

const app = express();



app.use(cors());
app.use(express.json());
app.use(bodyParser.json())



app.post('/signin', (req,res) => { 
    db.select('email', 'hash').from('login')
    .where('email', '=', req.body.email)
    .then(data => {
        const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
        if(isValid) {
            return db.select('*').from('users')
            .where('email', '=', req.body.email)
            .then(user => {
                res.json(user[0])
            })
            .catch(err => res.status(400).json('unable to get user'))
        }
        else{
            res.status(400).json('wrong credentials');
        }
    })
    .catch(err => res.status(400).json('wrong credentials'))
})

app.post('/register', (req, res) => {register.handleRegister(req,res, db, bcrypt)})

    
   
app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    db.select('*').from ('users').where({id}
        ).then(user => {
            if(user.length) {
                res.json(user[0])
            } else {
                res.status(400).json('Not Found')
            }
        })
        .catch(err => res.status(400).json('Error getting user'))
    })
    // if(!found) {
    //     res.status(404).json('not found')
    // }


app.put('/image', (req, res) => {
    const { id } = req.body;
    db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
        res.json(entries[0]);

    })
    .catch(err => res.status(400).json('Unable to get entires'))
    })
    
const PORT = process.env.PORT;
app.listen(process.env.PORT || 3000, () => {
    
    console.log(`app is running on port ${process.env.PORT}`)
})

/*
/ --> res = this is working 
/signin --> POST = success/fail
/register --> POST = user
/profile/:userId --> GET/
/image --> PUT --> user 

*/
