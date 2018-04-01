const Cron = require('node-crontab');
const Sync = require('./../sync/sync.service');
const TaskService = require('./../task/task.service');

let scheduleJobs = [];

const addTask = (task) => {
  const job = Cron.scheduleJob(task.schedule, Sync.execTask, [task]);
  scheduleJobs.push({job, task});
}

const updateTask = (_task) => {
    const indexScheduleJob = scheduleJobs.findIndex((scheduleJob) => scheduleJob.task.id === _task.id);
    
    if (indexScheduleJob > -1) {
        Cron.cancelJob(scheduleJobs[indexScheduleJob].job);
        scheduleJobs.splice(indexScheduleJob, 1);
    }
    
    addTask(_task);
}

const init = () => {
    TaskService.findAll()
        .then((tasks) => {
            console.log(tasks);
            tasks.forEach(task => addTask(task));
        })
        .catch((err) => console.error(err));
}

module.exports = { init, updateTask };