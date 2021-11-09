const express = require('express');
const { model } = require('mongoose');
const User = require('../models/user');
const router = new express.Router();
const auth = require('../middleware/authentication');;

router.post('/users', async (req, res) =>{
    const user = new User(req.body);

    try{
        await user.save();
        const token = await user.getAuthToken();
        res.status(201).send({user, token});
    }catch(e){
        res.status(400).send(e);
    }
});

router.post('/user/login', async (req, res) => {
    try{
        const user = await User.findByCredentials(req.body.username, req.body.password);
        const token = await user.getAuthToken();
        res.send({user, token});
    }catch(e){
        res.status(404).send(e);
    }
});

router.post('/user/logout', auth, async(req,res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== token;
        })
        await req.user.save();
        res.send();
    }catch(e){
        res.status(500).send();
    }
});

router.get('/user/me', auth, async (req, res) => {

    res.send(req.user);
});

router.patch('/user/me', auth, async(req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'username'];
    const validUpdates = updates.every((update) => allowedUpdates.includes(update));
    if(!validUpdates){
        res.status(400).send({error:'Invalid updates!'});
    }
    try{
        updates.forEach((update) => req.user[update] = req.body[update]);
        await req.user.save();
        if(!req.user){
            res.status(404).send();
        }
        res.send(req.user);
    }catch(e){
        res.status(500).send(e);
    }
});

router.delete('/user/me', auth, async(req, res) => {
    try{
        await req.user.remove();
        res.send(req.user);
    }catch(e){
        res.status(500).send();
    }
});

module.exports = router;