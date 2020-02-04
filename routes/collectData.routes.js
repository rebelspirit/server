const {Router} = require('express');
const {check, validationResult} = require('express-validator');
const CollectedData = require('../models/CollectedData');

const router = Router();

// /api/collected/data
router.post(
    '/data',
    [
        check('ip', 'Некорректный IP адрес').not().isEmpty(),
        check('continent', 'Некорректная Континент').not().isEmpty(),
        check('country', 'Некорректная Страна').not().isEmpty(),
        check('city', 'Некорректный Город').not().isEmpty()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);

            if(!errors.isEmpty()){
                return res.status(400).json({
                    errors: errors.array(),
                    message: "Некорректные данные геолокации"
                })
            }

            const {ip, continent, country, city, source, campaign} = req.body;
            const candidateIp = await  CollectedData.findOne({ip});

            if(candidateIp) {
                candidateIp.view++;
                console.log(`IP adress: ${candidateIp.ip} view: ${candidateIp.view}`);
                await candidateIp.save();
                return res.status(201).json({message: 'Количество посещений выросло'});
            }

            const localizationData = new CollectedData({ip, continent, country, city, source, campaign});

            await localizationData.save();

            console.log("Save data from external resource: ", req.body);
            res.status(201).json({message: "Новый IP адрес добавлен в базу"})

        } catch (e) {
            res.status(500).json({message: 'Что-то пошло не так, при добавлении данных геолокации'});
        }
    });

// For GET all IPs
router.get('/', async (req, res) => {
    try {
        const ip = await CollectedData.find({});
        res.json(ip)
    } catch (e) {
        res.status(500).json({message: 'Что-то пошло не так, при получении данных геолокации от сервера'});
    }
});

router.post('/remove', async (req, res) => {

    try {
        const {ip} = req.body;
        const candidateIp = await CollectedData.findOne({ip});

        if(candidateIp) {
            console.log("Request for remove: ", req.body);

            await CollectedData.deleteOne({ip});

            console.log("Remove IP from database: ", candidateIp.ip);

            return res.status(201).json({message: "IP адрес удален из базы"})
        }

        res.status(404).json({message: "Такого IP адреса нет в базе"})
    } catch (e) {
        res.status(500).json({message: 'Что-то пошло не так, удалении обьекта из базы'});
    }
});

module.exports = router;