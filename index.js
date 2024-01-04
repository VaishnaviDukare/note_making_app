const dotenv=require('dotenv')
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const notes =require('./models/notes')
const { body, validationResult } = require('express-validator');
const app = express();
const port = 3000;

//MongoDB Connection
const URL=process.env.CONNECTION_URL;
mongoose.connect(URL, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

app.use(bodyParser.json());

//Validation 
const validateNotes = [
  body('title').isString().notEmpty().isLength({ max: 255 }),
  body('content').isString().notEmpty().isLength({ max: 1000 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];


//This are the APIs
//Create a note

app.post('/notes',validateNotes,async(req,res)=>{
    try{
        const {title,content}=req.body;
        const note=new notes({title,content});
        await note.save();
        res.status(201).json(note);
    }
    catch(error){
        res.status(400).json({ error: error.message });
    }
})


//Retrieve Notes
app.get('/notes',async(req,res)=>{
    try {
        const note=await notes.find();
        if (!note) {
          return res.status(404).json({ error: 'Note not found' });
        }
        res.json(note);
    } catch (error) {
        res.status(500).json({ error:'Internal server Error' });
    }
})



//Retrieve Single notes
app.get('/notes/:id',async(req,res)=>{
    try {
        const note=await notes.findById(req.params.id);
        if(!note){
            return res.status(404).json({ error: 'Note not found' });
        }
        res.json(note);
      } catch (error) {
        if (error.name === 'CastError') {
          return res.status(400).json({ error: 'Invalid note ID format' });
        }
        res.status(500).json({ error: 'Internal Server Error' });
      }

})


//Update the note
app.put('/notes/:id',validateNotes, async (req, res) => {
    try {
      const { title, content } = req.body;
      const note = await notes.findByIdAndUpdate(
        req.params.id,
        { title, content, updatedAt: Date.now() },
        { new: true }
      );
      if (!note) {
        return res.status(404).json({ error: 'Note not found' });
      }
      res.json(note);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

// Delete Note
app.delete('/notes/:id', async (req, res) => {
    try {
      const note = await notes.findByIdAndDelete(req.params.id);
      if (!note) {
        return res.status(404).json({ error: 'Note not found' });
      }
      res.json({ message: 'Note deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });



  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
  

