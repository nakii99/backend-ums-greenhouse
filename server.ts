import Express, { NextFunction,Request,Response } from "express";
import * as mqtt from "mqtt"
import { Sequelize, DataTypes, where, Op, Model } from "sequelize";
import { CronJob } from "cron";
import cors from 'cors';
import * as types from './types_db'; 

const server = Express();
const mqttClient = mqtt.connect('wss://test.mosquitto.org:8081/');
mqttClient.subscribe('ums/greenhouse/web');

server.use(cors());

let stuff = ['TEMP','HUM','GHUM'];

let optionsTemp = {
    'TEMP': types.tempTemp,
    'HUM': types.humTemp,
    'GHUM': types.ghumTemp
}

let options = {
    'TEMP': types.temp,
    'HUM': types.hum,
    'GHUM': types.ghum
}

mqttClient.on('message',async (topic:string,payload:Buffer)=>{
    let message = payload.toString().split('#');
    const currentVal = {value: parseInt(message[1]),date:Date.now()}
    await optionsTemp[message[0] as keyof typeof optionsTemp].build(currentVal).save();
});

const cronJob = new CronJob('* * * * *',addAverages);
cronJob.start();

function addAverages() {
    stuff.forEach(async (sensor:string)=>{
        const tempValues = await optionsTemp[sensor as keyof typeof optionsTemp].findAll();
    if(tempValues.length) {
        let total = 0;
        tempValues.forEach((temp:any)=>{
            total += temp.getDataValue('value');
        });
        const average = total/tempValues.length;
        await optionsTemp[sensor as keyof typeof optionsTemp].destroy({where:{}});
        
        const averageVal = options[sensor as keyof typeof options].build({value:average,date:Date.now()});
        averageVal.save();
    }
    });
}


server.listen(3000);

server.get('/:sensor/:days',async (req:Request,res:Response,next:NextFunction)=>{
    let days = parseInt(req.params.days);
    let sensor = req.params.sensor;
    const daysAgo = new Date(new Date().setDate(new Date().getDate() - days));
    const stuff = await options[sensor as keyof typeof options].findAll({where:{
        date: {
            [Op.gt]: daysAgo,
            [Op.lt]: Date.now()
        }
    }});
    res.send(stuff);
});