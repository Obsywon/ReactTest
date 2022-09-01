const mongoose = require('mongoose');
mongoose.connect(
    process.env.DB_MONGO,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    (error) => {
        if (!error)
        {
            console.log('MongoDB connected.')
        }else{
            console.log('Connection error: '+ error)
        }
    }
)