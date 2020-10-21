function getProjectId () {
    var rx = /.*project_board\/(\d*).*/;
    var arr = rx.exec(window.location.href);
    return arr[1]
}

const state = {
    tasks: []
}

// instead of => { return our_html }
const view = (state) => `
    <section class="ProjectColumnGrid">
            <section class="todosection ProjectColumns"  ondragover="event.preventDefault()" ondrop="app.run('addToToDo', event)">
                <h3>To-do</h3>
                <div class="task">
                <form onsubmit="app.run('add', this);return false;" style="text-align: center">
                    <input name="task" placeholder="add a task" />
                    <button class="plus-button">+</button>
                </form>
                </div>
                <div>
                    <ul>
                    ${state.tasks.filter(task => task.status == 0).map(task => `<li id="${task.id}" draggable="true" ondragstart="app.run('dragFromTask', event)"><a href="/project_board/${getProjectId()}/edit_task/${task.id}" class="button">✏️</a> ${task.name}</li>`).join("")}
                    </ul>
                </div>
            </section>

            <section class="doingsection ProjectColumns" ondragover="event.preventDefault()" ondrop="app.run('addToDoingTask', event)">
                <h3>Doing</h3>
                    <ul>
                    ${state.tasks.filter(task => task.status == 1).map(task => `<li id="${task.id}" draggable="true" ondragstart="app.run('dragFromTask', event)"><a href="/project_board/${getProjectId()}/edit_task/${task.id}" class="button">✏️</a> ${task.name}</li>`).join("")}
                    </ul>
            </section>

            <section class="donesection ProjectColumns" ondragover="event.preventDefault()" ondrop="app.run('addToDoneTask', event)">
                <h3>Done</h3>
                <ul>
                    ${state.tasks.filter(task => task.status == 2).map(task => `<li id="${task.id}" draggable="true" ondragstart="app.run('dragFromTask', event)"><a href="/project_board/${getProjectId()}/edit_task/${task.id}" class="button">✏️</a> ${task.name}</li>`).join("")}
                </ul>
            </section>
    </section>

    <section class="deletesection" ondragover="event.preventDefault()" ondrop="app.run('deleteTask', event)">
        <h1>♻</h1>
    </section>
`
const update = {
    add: (state, form) => {
        const data = new FormData(form)
        if (data.get('task').length > 0) {
            const task = {
                id: window.crypto.getRandomValues(new Uint8Array(3)).join(""),
                name: data.get('task'),
                ProjectId: getProjectId(),
                status: 0
            }
            const postRequest = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(task)
            }
            fetch('/tasks', postRequest).then(() => app.run('getTasks'))
            return state
        }
    },
    editTask: (state, event) => {
        const id = event.dataTransfer.getData('text')
        const task = state.tasks.find(task => task.id == id)
        const postRequest = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        }
        fetch('/tasks/editTask', postRequest).then(res => res.json())
        return state
    },
    dragFromTask: (state, event) => {
        event.dataTransfer.setData('text', event.target.id)
        return state
    },
    addToToDo: (state, event) => {
        const id = event.dataTransfer.getData('text')
        const task = state.tasks.find(task => task.id == id)
        const postRequest = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        }
        fetch('/addToToDo', postRequest).then(() => app.run('getTasks'))
        return state
    },
    addToDoingTask: (state, event) => {
        const id = event.dataTransfer.getData('text')
        const task = state.tasks.find(task => task.id == id)
        const postRequest = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        }
        fetch('/addToDoing', postRequest).then(() => app.run('getTasks'))
        return state
    },
    addToDoneTask: (state, event) => {
        const id = event.dataTransfer.getData('text')
        const task = state.tasks.find(task => task.id == id)
        const postRequest = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        }
        fetch('/addToDone', postRequest).then(() => app.run('getTasks'))
        return state
    },
    deleteTask: (state, event) => {
        const id = event.dataTransfer.getData('text')
        const task = state.tasks.find(task => task.id == id)
        const postRequest = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        }
        fetch('/deleteTask', postRequest).then(() => app.run('getTasks'))
        return state
    },
    getTasks: async (state) => {
        state.tasks = await fetch('/tasks/' + getProjectId()).then(res => res.json())
        return state
    },
}

app.start('todoApp', state, view, update)
app.run('getTasks')
