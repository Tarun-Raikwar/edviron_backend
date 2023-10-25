const serverless = require('serverless-http');
const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const mongoose = require('mongoose');

const duesSchema = new mongoose.Schema({
    fee_head: mongoose.Schema.Types.ObjectId,
    student: mongoose.Schema.Types.ObjectId,
    due_date: Date,
});


const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phone_number: [String],
    edviron_id: Number,
    school_generated_id: String,
    school_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School', // Reference to another model, if needed
    },
    class: String,
    section: String,
    category: String,
    dob: Date,
    gender: String,
    previous_session_dues: Number,
    updatedAt: Date,
    additional_details: {
        aadhaar_number: String,
        address: {
            father_name: String,
            mother_name: String,
        },
    },
});

const Students = mongoose.model('students', studentSchema);

const Dues = mongoose.model('dues', duesSchema);


const connection = async () => {

    try {
        await mongoose.connect('mongodb+srv://assignment:edviron@cluster1.focovdw.mongodb.net/', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('database connected');

    } catch (error) {
        console.log("error while connecting to database", error.message);
    }
}

connection();


app.get('/getDefaulters', async (req, res) => {

    try {
        //Get the current date
        const currentDate = new Date();

        // Find documents where due_date is less than the current date
        const dueStudents = await Dues.find({ due_date: { $lt: currentDate } });

        // Extract student IDs from the found documents
        const studentIds = dueStudents.map(due => due.student);
       
        const students = await Students.find({
            _id: { $in: studentIds }
        });

        res.status(200).json({students});
    } catch (error) {
        console.error('Error while retrieving due students:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

});

app.listen(3000, () => console.log(`Listening on: 3000`));
// module.exports.handler = serverless(app);
