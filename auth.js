const mysql = require("mysql");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const db = mysql.createConnection({
    host: process.env.DATABASE_Host,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
});
exports.login =(req, res) => {
    console.log(req.body);
    const email = req.body.email;
    const password= req.body.password;
    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide an email and password' });
    }

    db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ message: 'Server error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Email or password is incorrect' });
        }

        const user = results[0];

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.render('login', {
                message: 'Email or password is incorrect' 
            });
        }

        const token = jwt.sign({ id: user.id }, 'your_jwt_secret', {
            expiresIn: '1h'
        });

        return res.render('login', {
            message: 'Login successful',
        });
            
            
        
    });
};

exports.register =(req, res) => {
    console.log(req.body);
    
    const name = req.body.name;
    const email = req.body.email;
    const password= req.body.password;
    const passwordConfirm = req.body.passwordConfirm;
    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide an email and password' });
    }
db.query('SELECT email FROM users WHERE email = ?', [email], async (error, results) =>{
    if(error) {
        console.log(error);
    }
    if( results.length > 0 ){
        return res.render('register', {
            message:'that email is already in use'
        })
    } else if(password !== passwordConfirm ) {
        return res.render('register', {
            message:'passwords do not match'
        });
    }
let hashedPassword =await bcrypt.hash(password, 8);
console.log(hashedPassword);

db.query('INSERT INTO users SET ?' , {name: name, email: email, password: hashedPassword }, (error, results) =>{
 if(error){
    console.log(error);
 } else {
    console.log(results);
    return res.render('register', {
        message: 'User registered'
    });

 }
})
});

    
}