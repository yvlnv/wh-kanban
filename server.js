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

app.get('/project_board/:id', async (req, res) => {
    const project = await Project.findByPk(req.params.id)
    const users = await project.getUsers()
    const tasks = await Task.findAll({
        where: {
            ProjectId : req.params.id
        }
    })
    res.render('project_board', {project, users, tasks})
})

app.get('/project_board/:id/add_task', async (req, res) => {
    const project = await Project.findByPk(req.params.id)
    users = await project.getUsers()
    res.render('add_task', {project, users})
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

app.get('/tasks/:id', async (req, res) => {
    const tasks = await Task.findAll({
        where: {
            ProjectId : req.params.id
        }
    })
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

app.post('/project_board/:id/add_task', async (req, res) => {
    await Task.create(req.body)
    res.redirect(`/project_board/${req.params.id}`)
})
		
app.post('/project_board/:id/add_collaborator', async (req, res) => {	
    const project = await Project.findByPk(req.params.id)	
    // This should be done without for to speed it up	
    for (user_id of req.body.collaborators) {
        await project.addUsers(Number(user_id))	
    }	
    res.redirect(`/project_board/${req.params.id}`)	
})

app.post('/project_board/:id/edit_task/:tasks_id', async (req, res) => {
    const task = await Task.findByPk(req.params.tasks_id)
    task.update(req.body)
    res.redirect(`/project_board/${req.params.id}`)
})

app.post('/project_board/:id/delete_task/:tasks_id', async (req, res) => {
    const task = await Task.findByPk(req.params.tasks_id)
    task.destroy()
    res.redirect(`/project_board/${req.params.id}`)
})

app.post('/tasks', async (req,res) => {
    await Task.create(req.body)
    res.send()
})

// SERVER LOCATION
app.listen(process.env.PORT, () => {
    sequelize.sync(() => {
        console.log('Kanban app running on port', process.env.PORT)
    })
})

