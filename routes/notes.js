const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const Note = require("../models/Note");
const { body, validationResult } = require("express-validator");

//Route1:Get all the Notes:GET "/api/notes/fetchallnotes"Login required

router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await notes.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("some Error occured");
  }
});
//Route2:Add a new  Note using Post:"/api/auth/addnote"Login required

router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Enter valid title").isLength({ min: 3 }),

    body("description", "description atleast 5 character").isLength({ min: 5 }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;

      //if there are errors,return bad requist and the errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const note = new Note({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const savedNote = await note.save();
      res.json(savedNote);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("some Error occured");
    }
  }
);
// Route 3:Update an existing Notes Put "/api/auth/update"login requred
router.put("/updatenote/:id", fetchuser, async (req, res) => {
  const { title, description, tag } = req.body;
  try {
    //Create a newNote object
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }

    //Find the note to be updated and updtae it
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    }

    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not allowed");
    }
    note = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json({ note });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("some Error occured");
  }
});

// Route 4:Delete an existing Notes Delete"/api/notes/deletenote"login requred
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
   
  try {
    //Find the note to be deleted  and delete it
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    }

    // allow Deletion only user owns note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not allowed");
    }
    note = await Note.findByIdAndDelete(req.params.id);
    res.json({ Success: "Notes has been deleted", note: note });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("some Error occured");
  }
});

module.exports = router;
