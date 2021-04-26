const { User, Thought, Reaction } = require('../models');

const thoughtControl = {

getThoughts(req, res) {
  Thought.find({})
  .populate({ path: 'reactions', select: '-__v' })
  .select('-__v')
  .then(dbThoughtData => res.json(dbThoughtData))
  .catch(err => {
    console.log(err);
    res.status(500).json(err);
  })
},

getThoughtById({ params }, res) {
  Thought.findOne({ _id: params.id })
  .populate({ path: 'reactions', select: '-__v' })
  .select('-__v')
  .then(dbThoughtData => {
    if (!dbThoughtData) {
      res.status(404).json({message: 'No thought found with this id'});
      return;
  }
  res.json(dbThoughtData);
  })
  .catch(err => {
    console.log(err);
    res.status(400).json(err);
  });
},

createThought({ body }, res) {
  Thought.create(body)
  .then(dbThoughtData => {
  User.findOneAndUpdate(
    { username: body.username },
    { $push: { thoughts: dbThoughtData._id } },
    { new: true }
  )
  .then(dbUserData => {
    if (!dbUserData) {
      res.status(404).json({ message: 'No user found with this username' });
      return;
    }
  res.json(dbUserData);
  })
  .catch(err => res.json(err));
})
  .catch(err => res.status(400).json(err));
},

updateThought({ params, body }, res) {
  Thought.findOneAndUpdate(
    { _id: params.id },
    body,
    { new: true }
  )
  .then(dbThoughtData => {
    if (!dbThoughtData) {
      res.status(404).json({ message: 'No thought found with this id' });
      return;
    }
    res.json(dbThoughtData);
  })
  .catch(err => res.status(400).json(err));
},

deleteThought({ params }, res) {
    Thought.findOneAndDelete({ _id: params.id })
    .then(dbThoughtData => {
      if (!dbThoughtData) {
        res.status(404).json({ message: 'No thought found with this id'});
        return;
      }
    User.findOneAndUpdate(
      { username: dbThoughtData.username },
      { $pull: { thoughts: params.id } }
    )
    .then(() => {
      res.json({message: 'Deleted thought!'});
    })
    .catch(err => res.status(500).json(err));
    })
    .catch(err => res.status(500).json(err));
},

createReaction({ params, body }, res) {
  Thought.findOneAndUpdate(
    { _id: params.thoughtId },
    { $addToSet: { reactions: body } },
    { new: true, runValidators: true }
  )
  .then(dbThoughtData => {
    if (!dbThoughtData) {
      res.status(404).json({ message: 'No thought found with this id' });
      return;
    }
      res.json(dbThoughtData);
  })
  .catch(err => res.status(500).json(err));
},

deleteReaction({ params }, res) {
  Thought.findOneAndUpdate(
      { _id: params.thoughtId },
      { $pull: { reactions: { reactionId: params.reactionId } } },
      { new: true }
  )
  .then(dbThoughtData => {
    if (!dbThoughtData) {
      res.status(404).json({ message: 'No thought found with this id' });
      return;
    }
    res.json({message: 'Deleted reaction!'});
    })
    .catch(err => res.status(500).json(err));
  },
}

module.exports = thoughtControl;