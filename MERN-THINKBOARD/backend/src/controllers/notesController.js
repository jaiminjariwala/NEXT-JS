export const getAllNotes = (req, res) => {
  res.status(200).send("You just fetched the notese")
}

export const createNote = (req, res) => {
  res.status(201).json({message: "Note created successfully"})
}

export const updateNote = (req, res) => {
  res.status(200).json({message: "Note has been updated"})
}

export const deleteNote = (req, res) => {
  res.status(200).json({message: "Note has been deleted"})
}