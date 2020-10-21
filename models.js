const {Sequelize, Model, DataTypes} = require('sequelize')
const path = require('path')
// const sequelize = process.env.NODE_ENV === 'test'
//     ? new Sequelize('sqlite::memory:', null, null, {dialect: 'sqlite'})
//     : new Sequelize({dialect: 'sqlite', storage: path.join(__dirname, 'data.db')})

const connectionSettings = {
    test: {dialect: 'sqlite', storage: 'sqlite::memory:'},
    dev: {dialect: 'sqlite', storage: path.join(__dirname, 'data.db')},
    production: {dialect: 'postgres', protocal: 'postgres'}
}
const sequelize = process.env.NODE_ENV === 'production'
    ? new Sequelize(process.env.DATABASE_URL, connectionSettings[process.env.NODE_ENV])
    : new Sequelize(connectionSettings[process.env.NODE_ENV])


class User extends Model {}
User.init({
    name: DataTypes.STRING,
    image: DataTypes.STRING
}, {sequelize})

class Project extends Model {}
Project.init({
    name: DataTypes.STRING
}, {sequelize})

class Task extends Model {}
Task.init({
    name: DataTypes.STRING,
    state: {
        type: DataTypes.INTEGER, 
        defaultValue: 0}
}, {sequelize})

Project.hasMany(Task, {as: 'tasks'})
User.hasMany(Task)
Task.belongsTo(User)
UserProject = sequelize.define('user_project')
User.belongsToMany(Project, { through: UserProject })
Project.belongsToMany(User, { through: UserProject })

module.exports = {
    User,
    Project, 
    Task,
    sequelize
}
