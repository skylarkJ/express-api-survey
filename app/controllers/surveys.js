'use strict';

const controller = require('lib/wiring/controller');
const models = require('app/models');
const Survey = models.survey;

const authenticate = require('./concerns/authenticate');
const setUser = require('./concerns/set-current-user');
const setModel = require('./concerns/set-mongoose-model');
const store = require('./store.js');

const index = (req, res, next) => {
  Survey.find()
    .then(surveys => res.json({
      surveys: surveys.map((e) =>
        e.toJSON({ virtuals: true, user: req.user })),
    }))
    .catch(next);
};

const show = (req, res) => {
  res.json({
    survey: req.survey.toJSON({ virtuals: true, user: req.user }),
  });
};

const create = (req, res, next) => {
  let survey = Object.assign(req.body.survey, {
    _owner: req.user._id,
  });
  Survey.create(survey)
    .then(survey =>
      res.status(201)
        .json({
          survey: survey.toJSON({ virtuals: true, user: req.user }),
        }))
    .catch(next);
};

const update = (req, res, next) => {
  console.log('UPDATE');
  delete req.body._owner;  // disallow owner reassignment.

  Survey.findById(req.params.id, function (err, survey) {
    // Handle any possible database errors
      // console.log(survey.questions.length);
      // console.log((survey.questions).push(req.body.survey.questions));
    if (err) {
        res.status(422).send(err);
    } else {
      // Update each attribute with any possible attribute that may have been submitted in the body of the request
      // If that attribute isn't in the request body, default back to whatever it was before.

      // make an if to see if ownership is needed. If so, only create question
    if (req.survey._owner === req.user.id) {
     survey.questions[survey.questions.length] = req.body.survey.questions;
    } else {
     // if no ownership, only updates answer
     console.log(req);

   }

}




      // Save the updated document back to the database
      survey.save(function (err, survey) {
            if (err) {
                res.status(500).send(err);
            }
            res.send(survey);
      });

  });
};


const destroy = (req, res, next) => {
  req.survey.remove()
    .then(() => res.sendStatus(204))
    .catch(next);
};

module.exports = controller({
  index,
  show,
  create,
  update,
  destroy,
}, { before: [
  { method: setUser, only: ['index', 'show'] },
  { method: authenticate, only: ['index', 'show', 'update', 'create', 'destroy'] },
  { method: setModel(Survey), only: ['show'] },
  { method: setModel(Survey, { forUser: true }), only: ['update', 'destroy'] },
], });
