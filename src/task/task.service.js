const TaskModel = require('./task.model');

const save = () => {

};

const findById = (_id) => {

};

const findAll = () => {
    return TaskModel.findAll().then((tasks) => tasks.map(task => task.dataValues));
};

module.exports = { save, findById, findAll }
