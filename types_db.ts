import { DataTypes, Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const database = new Sequelize(process.env.DATABASE as string,process.env.USERNAME as string, process.env.PASS as string,{
    host: '127.0.0.1',
    dialect: 'mariadb'
});

let schema = {
    value: DataTypes.INTEGER,
    date: DataTypes.DATE
};

const tempTemp = database.define('temp_t',schema);
const temp = database.define('temp',schema);

const humTemp = database.define('hum_t',schema);
const hum = database.define('hum',schema);

const ghumTemp = database.define('ghum_t',schema);
const ghum = database.define('ghum',schema);

tempTemp.sync();
temp.sync();
humTemp.sync();
hum.sync();
ghumTemp.sync();
ghum.sync();

export {tempTemp,temp,humTemp,hum,ghumTemp,ghum}