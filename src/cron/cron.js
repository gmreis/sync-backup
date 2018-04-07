const Cron = require('node-crontab');
const Sync = require('./../sync/sync.service');
const TaskService = require('./../task/task.service');

let scheduledJobs = [];

const scheduleJob = (task) => {
    const job = Cron.scheduleJob(task.schedule, Sync.execTask, [task]);
    scheduledJobs.push({ job, task });
}

const updateTask = (_task) => {
    const indexScheduledJob = scheduledJobs.findIndex((scheduledJob) => scheduledJob.task.id === _task.id);

    if (indexScheduledJob > -1) {
        Cron.cancelJob(scheduledJobs[indexScheduledJob].job);
        scheduledJobs.splice(indexScheduledJob, 1);
    }

    addTask(_task);
}

const init = () => {
    TaskService.findAll()
        .then((tasks) => {
            console.log(tasks);
            tasks.forEach(task => scheduleJob(task));
        })
        .catch((err) => console.error(err));
}

module.exports = { init, updateTask };