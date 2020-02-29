const express = require('express');
// const bodyParser = require('body-parser');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
// Retrieve list of all favorite campsites
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({
        user: req.user._id
    })
    .then(favorite => {
        console.log(favorite);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    })
    .catch(err => next(err));
})
// User submits array of campsiteIds in request body
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    // check if favorite documents exists for user
    Favorite.findOne({
        user: req.user._id
    })
    .then(favorite => {
        // if so, only add campsiteIds not already in favorite document
        if (favorite) {
            if (favorite.campsites.indexOf(favorite._id) == -1) {
                req.body.forEach(fav => {
                    if (!favorite.campsites.includes(fav._id)) {
                        favorite.campsites.push(fav._id);
                    }
                });
            }
            favorite.save()
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));
        } else {
            // if no favorite document, create one for user and add campsites to it
            Favorite.create({
                user: req.user._id,
                campsites: req.body 
            })
            .then(favorite => {
                console.log('Favorite Created ', favorite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));
        }
    }) 
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
// If there is a favorite document for the user, delete it
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({
        user: req.user._id
    })
    .then(favorite => {
        if (favorite) {
            let x = favorite.campsites.indexOf(req.user._id);
            if (x !== -1) {
                favorite.campsites.splice(x, 1)
                .then(response => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(response);
                })
                .catch(err => next(err));
            } 
        } else {
            res.end('User has no favorites to delete!');
        }
    })
    .catch(err => next(err));
})

favoriteRouter.route('/:campsiteId')
// campsiteID submitted as URL parmeter (req.params.campsiteId)
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`GET operation not supported on /favorites/${req.params.campsiteId}`);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    // Check if favorite document exists for user
    Favorite.findOne({
        user: req.user._id
    })
    .then(favorite => {
    // if so, only add campsiteId if not already in favorite document
    console.log(favorite);
        if (favorite) {
            let x = favorite.campsites.indexOf(favorite._id);
            console.log(x);
            if (x == -1) {
                favorite.campsites.push(favorite._id);
                favorite.save()
                .then(favorite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
                .catch(err => next(err));
            } else {
                res.end('That campsite is already in the list of favorites!');
            }
        } else {
            // if no campsite document for user, add one and add the campsite from the URL parameter to its array of campsites
            Favorite.create({
                user: req.user._id,
                campsites: req.body 
            })
            .then(favorite => {
                console.log('Favorite Created ', favorite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));
        }
    }) 
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /favorites/${req.params.campsiteId}`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    // If there is a favorite document for the user, check if campsiteId from URL param is in its campsites array, delete if so
})


module.exports = favoriteRouter; 