require('dotenv').config();

const express = require('express');
const app = express();

const path = require('path');
const morgan = require('morgan');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('./config/dbConnect');
const mongoose = require('mongoose');
const methodOverride = require('method-override');

connectDB();

/**
 * @Routers
 */
const authRouter = require('./routes/auth');
const mainRouter = require('./routes/main');

/**
 * @Middlewares
 */
require('./middleware/localStrategy')(passport);
require('./middleware/GoogleStrategy')(passport);
const { userIsAuth } = require('./middleware/checkIsAuth');

if (process.env.NODE_ENV === 'Development') {
	app.use(morgan('dev'));
}

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false })); //middleware in an Express.js application is used to parse incoming data from HTML forms submitted via POST requests. making it accessible in req.body
app.use(
	session({
		secret: 'hello world',
		resave: false,
		saveUninitialized: false,
		cookie: { httpOnly: true },
		store: MongoStore.create({ mongoUrl: process.env.MONGO_URI, collectionName: 'sessions' }),
	})
);
app.use(methodOverride('_method'));

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('/', userIsAuth, (req, res) => {
	console.log('User is authenticated: ' + req.isAuthenticated());
	res.render('index');
});
app.use('/auth', authRouter);
app.use('/main', mainRouter);

const port = process.env.PORT || 3000;
mongoose.connection.once('open', () => {
	console.log(`Connected to database`);
	app.listen(port, () =>
		console.log(`Server is in ${process.env.NODE_ENV} mode and running on port ${port}`)
	);
});
