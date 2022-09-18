const Sauce = require('../models/Sauce');
const auth = require('../middleware/auth');
const fs = require('fs');


exports.createSauce = (req, res, next) => {

    /* createSauce sans multer */
    //delete req.body._id;
    // const sauce = new Sauce({
    //     ...req.body
    // });
    // sauce.save()
    //     .then(() => res.status(201).json({ message: 'Objet enregistré !' }))
    //     .catch(error => res.status(400).json({ error }));

    /* createSauce avec multer */
    console.log(req.body);
    console.log(req.body.sauce);
    const sauceObjet = JSON.parse(req.body.sauce);
    console.log(sauceObjet);
    console.log(req.auth.userId);
    delete sauceObjet._id;
    delete sauceObjet.userId;
    const sauce = new Sauce({
        ...sauceObjet,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    console.log(sauce);
    sauce.save()
        .then(() => { res.status(201).json({ message: 'Objet enregistré !' }) })
        .catch(error => { res.status(400).json({ error }) });
};

exports.GetOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
    /* sans multer */
    // console.log(req.body);
    // Sauce.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
    //     .then(() => res.status(200).json({ message: 'Objet modifié !' }))
    //     .catch(error => res.status(400).json({ error }))

    /* avec multer */
    // console.log(req.body);
    const sauceObjet = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete sauceObjet.userId;
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'non autorisé' });
            } else {
                if (req.file) {
                    const filename = sauce.imageUrl.split('/images/')[1];
                    fs.unlink(`images/${filename}`, (err) => {
                        if (err) console.log(err);
                    });
                }

                Sauce.updateOne({ _id: req.params.id }, { ...sauceObjet, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet modifié !' }))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch(error => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
    /* sans multer */
    // Sauce.deleteOne({ _id: req.params.id })
    //     .then(() => res.status(200).json({ message: 'Objet supprimé !' }))
    //     .catch(error => res.status(400).json({ error }));

    /* avec multer */
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'non autorisé' });
            } else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'Objet supprimé !' }) })
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

