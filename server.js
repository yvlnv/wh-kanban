// SERVER CONFIG
const express = require('express')
const Handlebars = require('handlebars')
const expressHandlebars = require('express-handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const app = express()
const {User, Task, Project, sequelize} = require('./models')
const handlebars = expressHandlebars({
    handlebars: allowInsecurePrototypeAccess(Handlebars)
})
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.engine('handlebars', handlebars)
app.set('view engine', 'handlebars')



// GET REQUESTS
app.get('/', (req, res) => {
    res.render('landing_page')
})

app.get('/view_all_projects', async (req, res) => {
    const projects = await Project.findAll({
        include: [{model: Task, as: "tasks"}]
    })
    res.render('all_project_boards', {projects})
})

app.get('/users', async (req, res) => {
    const users = await User.findAll()
    res.render('all_users', {users})
})

app.get('/project_board/:id', async (req, res) => {
    const project = await Project.findByPk(req.params.id)
    const users = await project.getUsers()
    res.render('project_board', {project, users})
})

app.get('/project_board/:id/rename', async (req, res) => {
    const project = await Project.findByPk(req.params.id)
    res.render('rename', {project})
})

app.get('/project_board/:id/edit_task/:tasks_id', async (req, res) => {
    const project = await Project.findByPk(req.params.id)
    const task = await Task.findByPk(req.params.tasks_id)
    const users = await project.getUsers()
    res.render('edit_task', {project, task, users})
})

app.get('/project_board/:id/add_collaborator', async (req, res) => {
    const users = await User.findAll()
    const project = await Project.findByPk(req.params.id)
    res.render('add_collaborator', {users, project})
})

app.get('/project_board/:id/delete', async (req, res) => {
    const project = await Project.findByPk(req.params.id)
    project.destroy()
    res.redirect('/')
})

app.get('/users/:id/delete', async (req, res) => {
    const user = await User.findByPk(req.params.id)
    user.destroy()
    res.redirect('/users')
})

app.get('/tasks/:id', async (req, res) => {
    const tasks = await Task.findAll({
        where: {
            ProjectId : req.params.id
        }
    })
    for (task of tasks) {
        if (task.UserId) {
            const user = await User.findByPk(task.UserId)
            task.dataValues.image = user.image
            task.dataValues.user_name = user.name
        } else {
            task.dataValues.user_name = 'unassigned'
        }
    }
    res.send(tasks)
})

// POST REQUESTS
app.post('/add_user', async (req, res) => {
    await User.create(req.body)
    res.redirect('/')
})

app.post('/new_project_board', async (req, res) => {
    const project = await Project.create(req.body)
    res.redirect(`/project_board/${project.id}`)
})
		
app.post('/project_board/:id/add_collaborator', async (req, res) => {	
    const project = await Project.findByPk(req.params.id)
    const tasks = await project.getTasks()
    const current_users = await project.getUsers()
    for (user of current_users) {
        project.removeUser(user)
    }
    for (task of tasks) {
        var old_user = false
        for (user_id of req.body.collaborators) {
            if (task.UserId == user_id) {
                old_user = true
            }
        }
        if (!old_user) {
            task.set('UserId', null).save()
        }
    }
    for (user_id of req.body.collaborators) {
        await project.addUsers(Number(user_id))	
    }	
    res.redirect(`/project_board/${req.params.id}`)	
})

app.post('/project_board/:id/edit_task/:tasks_id', async (req, res) => {
    const task = await Task.findByPk(req.params.tasks_id)
    task.update(req.body)
    if (req.body.UserId == 'null') {
        task.set('UserId', null).save()
    }
    res.redirect(`/project_board/${req.params.id}`)
})

app.post('/project_board/:id/delete_task/:tasks_id', async (req, res) => {
    const task = await Task.findByPk(req.params.tasks_id)
    task.destroy()
    res.redirect(`/project_board/${req.params.id}`)
})

app.post('/project_board/:id/rename', async (req, res) => {
    const project = await Project.findByPk(req.params.id)
    project.update(req.body)
    res.redirect(`/project_board/${req.params.id}`)
})

app.post('/tasks', async (req,res) => {
    await Task.create(req.body)
    res.send()
})

app.post('/addToToDo', async (req, res) => {
    const task = await Task.findByPk(req.body.id)
    task.set('status', 0).save()
    res.send()
})

app.post('/addToDoing', async (req, res) => {
    const task = await Task.findByPk(req.body.id)
    task.set('status', 1).save()
    res.send()
})

app.post('/addToDone', async (req, res) => {
    const task = await Task.findByPk(req.body.id)
    task.set('status', 2).save()
    res.send()
})

app.post('/deleteTask', async (req, res) => {
    const task = await Task.findByPk(req.body.id)
    task.destroy()
    res.send()
})

app.post('/getUserImage', async (req, res) => {
    const user = await User.findByPk(req.body.UserId)
    res.send(user.image)
})

// SERVER LOCATION
app.listen(process.env.PORT, () => {
    sequelize.sync(() => {
        console.log('Kanban app running on port', process.env.PORT)
    })
})

